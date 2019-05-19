import { SaveTokens, DeleteTokens, TokensExist, GetTokens, RefreshTokens } from './tokenStorage';
import { TokenRequest, AuthedRequest, Method } from './requests';
import { convertToQueryParamString } from './utils';
const base64 = require('base-64')

const BASE_URL = 'https://oauth.reddit.com';
const ACCESS_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const CLIENT_ID = 'Pa3XZ0BEHfz-PA';
const REDIRECT_URI = 'shuffler://settings';

export interface ListingParams {
  context?: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
  show?: 'given',
  sort?: 'hot' | 'new' | 'top' | 'controversial',
  t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all',
  type?: 'links' | 'comments',
  username?: string,
  after?: string,
  before?: string,
  count?: number,
  include_categories?: boolean,
  limit?: number,
  sr_detail?: boolean,
}

export const LoginURL = function() {
  const state = base64.encode(Math.random().toString());
  return {
    state: state,
    url: `https://www.reddit.com/api/v1/authorize?client_id=${
      encodeURIComponent(CLIENT_ID)
      }&response_type=code&state=${
      encodeURIComponent(state)
      }&redirect_uri=${
      encodeURIComponent(REDIRECT_URI)
      }&duration=permanent&scope=history%20identity%20save`,
  }
}

// TODO: split this into a new repo
// TODO: build out that repo (estimated: 2-3hrs total)
export const api = {
  auth: () => {
    return {
      authDetails: GetTokens,
      isAuthed: TokensExist,

      logout: DeleteTokens,
      login: async function(code: string) {
        const res = await TokenRequest.initialAuth(ACCESS_TOKEN_URL, CLIENT_ID, code);

        if (res.json.access_token && res.json.refresh_token && res.json.expires_in) {
          await SaveTokens(res.json.access_token, res.json.refresh_token, res.json.expires_in);
          return res;
        }
        throw(`error when authenticating: ${JSON.stringify(res)}`)
      },

      forceRefresh: function(){ return RefreshTokens(this.refresh) },

      refresh: async function(refreshToken: string) {
        const res = await TokenRequest.refresh(ACCESS_TOKEN_URL, CLIENT_ID, refreshToken);
        if (res.json.access_token && res.json.expires_in) {
          return {
            accessToken: res.json.access_token,
            expires_in: res.json.expires_in
          };
        }
        throw (`error when refreshing auth token: ${JSON.stringify(res)}`)
      },
    }
  },

  call: function() {
    const redditFetch = async (method: Method, url: string, params: { [s: string]: string; }) => {
      const urlWithQuery = url + convertToQueryParamString(params);
      const tokens = await GetTokens(api.auth().refresh);

      return AuthedRequest(method, urlWithQuery, tokens.AuthToken);
    }

    return {
      currentUser: async function() {
        const tokens = await GetTokens(api.auth().refresh);
        return await AuthedRequest('GET', BASE_URL + '/api/v1/me', tokens.AuthToken);
      },

      // TODO: group this better
      unsave: (id: string) => redditFetch('POST', BASE_URL + '/api/unsave', { "id": id }),

      user: function(username: string) {
        const userFetch = async (pathSuffix: string, params: ListingParams) => {
          const url = BASE_URL + `/user/${username}/${pathSuffix}`;
          return await redditFetch('GET', url, params as any);
        }

        const userFetchAll = async function(pathSuffix: string, params: ListingParams, updateCallback?: Function) {
          var items = [] as any[];
          var after = null;
          do {
            if (after) {
              params.after = after;
            }

            const res = await userFetch(pathSuffix, params)
            const fetchedItems = res.json.data.children;
            after = res.json.data.after;

            for (let i = 0; i < fetchedItems.length; i++) {
              items.push(fetchedItems[i]);
            }

            if (updateCallback) {
              updateCallback();
            }
          } while (after);

          return items;
        }

        return {
          comments: (params: ListingParams) => userFetch('comments', params),
          downvoted: (params: ListingParams) => userFetch('downvoted', params),
          gilded: (params: ListingParams) => userFetch('gilded', params),
          hidden: (params: ListingParams) => userFetch('hidden', params),
          overview: (params: ListingParams) => userFetch('overview', params),
          saved: (params: ListingParams) => userFetch('saved', params),
          submitted: (params: ListingParams) => userFetch('submitted', params),
          upvoted: (params: ListingParams) => userFetch('upvoted', params),
          where: (params: ListingParams) => userFetch('where', params),

          allComments: (params: ListingParams, updateCallback?: Function) => userFetchAll('comments', params, updateCallback),
          allDownvoted: (params: ListingParams, updateCallback?: Function) => userFetchAll('downvoted', params, updateCallback),
          allGilded: (params: ListingParams, updateCallback?: Function) => userFetchAll('gilded', params, updateCallback),
          allHidden: (params: ListingParams, updateCallback?: Function) => userFetchAll('hidden', params, updateCallback),
          allOverview: (params: ListingParams, updateCallback?: Function) => userFetchAll('overview', params, updateCallback),
          allSaved: (params: ListingParams, updateCallback?: Function) => userFetchAll('saved', params, updateCallback),
          allSubmitted: (params: ListingParams, updateCallback?: Function) => userFetchAll('submitted', params, updateCallback),
          allUpvoted: (params: ListingParams, updateCallback?: Function) => userFetchAll('upvoted', params, updateCallback),
          allWhere: (params: ListingParams, updateCallback?: Function) => userFetchAll('where', params, updateCallback),
        }
      },
    }
  },
};
export default api;