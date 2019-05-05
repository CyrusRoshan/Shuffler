import Reddit from '../secrets/Reddit'; // NOTE: this is gitignored for obvious reasons
import {saveTokens, deleteTokens, tokensExist, getTokens} from './tokens';
import {USER_AGENT, authedRequest, unauthedRequest} from './requests';
import {convertToQueryParamString} from './utils';

const BASE_URL = 'https://oauth.reddit.com';
const ACCESS_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const CLIENT_ID = 'NYDEcwiXOz1XPw';
const REDIRECT_URI = 'shuffler://settings';

const api = {
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

  isAuthed: tokensExist,
  login: async function(code: string) {
    const body = `grant_type=authorization_code&code=${code}&redirect_uri=shuffler%3A%2F%2Fsettings`
    const res = await fetch(ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
        'Authorization': `Basic ${btoa(CLIENT_ID + ':')}`,
      },
      body: body,
    }).then(r => r.json())

    if (res.access_token && res.refresh_token) {
      await saveTokens(res.access_token, res.refresh_token);
      return res;
    }

    throw(`error when authenticating: ${JSON.stringify(res)}`)
  },

  refresh: async function() {
    const tokens = await getTokens();
    return await authedRequest.post(ACCESS_TOKEN_URL, tokens.AuthToken, {
      'grant_type': 'refresh_token',
      'refresh_token': tokens.RefreshToken,
    })
  },

  currentUser: async function() {
    const tokens = await getTokens();
    return await authedRequest.get(BASE_URL + '/api/v1/me', tokens.AuthToken);
  },

  user: function(username: string) {
    interface userProps {
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

    const userFetch = async function(pathSuffix: string, props: userProps) {
      const url = BASE_URL + `/user/${username}/${pathSuffix}`

      const urlWithQuery = url + convertToQueryParamString(props);
      console.log(urlWithQuery)

      const tokens = await getTokens();
      return authedRequest.get(urlWithQuery, tokens.AuthToken);
    }
    return {
      comments: (props: userProps) => userFetch('comments', props),
      downvoted: (props: userProps) => userFetch('downvoted', props),
      gilded: (props: userProps) => userFetch('gilded', props),
      hidden: (props: userProps) => userFetch('hidden', props),
      overview: (props: userProps) => userFetch('overview', props),
      saved: (props: userProps) => userFetch('saved', props),
      submitted: (props: userProps) => userFetch('submitted', props),
      upvoted: (props: userProps) => userFetch('upvoted', props),
      where: (props: userProps) => userFetch('where', props),
    }
  }
};
export default api;