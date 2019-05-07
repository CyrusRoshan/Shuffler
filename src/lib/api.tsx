import Reddit from '../secrets/Reddit'; // NOTE: this is gitignored for obvious reasons
import {saveTokens, deleteTokens, tokensExist, GetTokens} from './tokens';
import {tokenRequest, authedRequest, unauthedRequest} from './requests';
import {convertToQueryParamString} from './utils';

const BASE_URL = 'https://oauth.reddit.com';
const ACCESS_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const CLIENT_ID = 'NYDEcwiXOz1XPw';
const REDIRECT_URI = 'shuffler://settings';

export interface QueryParams {
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

export const api = {
  loginURL: function() {
    const state = btoa(Math.random().toString());
    return {
      state: state,
      url: `https://www.reddit.com/api/v1/authorize?client_id=${
        encodeURIComponent(CLIENT_ID)
      }&response_type=code&state=${
        encodeURIComponent(state)
      }&redirect_uri=${
        encodeURIComponent(REDIRECT_URI)
      }&duration=permanent&scope=history%20identity`,
    }
  },

  authDetails: GetTokens,
  isAuthed: tokensExist,

  login: async function(code: string) {
    const res = await tokenRequest.initialAuth(ACCESS_TOKEN_URL, CLIENT_ID, code);

    if (res.json.access_token && res.json.refresh_token && res.json.expires_in) {
      await saveTokens(res.json.access_token, res.json.refresh_token, res.json.expires_in);
      return res;
    }
    throw(`error when authenticating: ${JSON.stringify(res)}`)
  },

  refresh: async function(refreshToken: string) {
    const res = await tokenRequest.refresh(ACCESS_TOKEN_URL, CLIENT_ID, refreshToken);
    if (res.json.access_token && res.json.expires_in) {
      return {
        accessToken: res.json.access_token,
        expires_in: res.json.expires_in
      };
    }
    throw (`error when refreshing auth token: ${JSON.stringify(res)}`)
  },

  currentUser: async function() {
    const tokens = await GetTokens();
    return await authedRequest.get(BASE_URL + '/api/v1/me', tokens.AuthToken);
  },

  user: function(username: string) {
    const userFetch = async function(pathSuffix: string, params: QueryParams) {
      const url = BASE_URL + `/user/${username}/${pathSuffix}`
      const urlWithQuery = url + convertToQueryParamString(params);

      const tokens = await GetTokens();
      return authedRequest.get(urlWithQuery, tokens.AuthToken);
    }

    const userFetchAll = async function(pathSuffix: string, params: QueryParams) {
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
      } while (after);

      return items;
    }

    return {
      comments: (params: QueryParams) => userFetch('comments', params),
      downvoted: (params: QueryParams) => userFetch('downvoted', params),
      gilded: (params: QueryParams) => userFetch('gilded', params),
      hidden: (params: QueryParams) => userFetch('hidden', params),
      overview: (params: QueryParams) => userFetch('overview', params),
      saved: (params: QueryParams) => userFetch('saved', params),
      submitted: (params: QueryParams) => userFetch('submitted', params),
      upvoted: (params: QueryParams) => userFetch('upvoted', params),
      where: (params: QueryParams) => userFetch('where', params),

      allComments: (params: QueryParams) => userFetchAll('comments', params),
      allDownvoted: (params: QueryParams) => userFetchAll('downvoted', params),
      allGilded: (params: QueryParams) => userFetchAll('gilded', params),
      allHidden: (params: QueryParams) => userFetchAll('hidden', params),
      allOverview: (params: QueryParams) => userFetchAll('overview', params),
      allSaved: (params: QueryParams) => userFetchAll('saved', params),
      allSubmitted: (params: QueryParams) => userFetchAll('submitted', params),
      allUpvoted: (params: QueryParams) => userFetchAll('upvoted', params),
      allWhere: (params: QueryParams) => userFetchAll('where', params),
    }
  }
};
export default api;