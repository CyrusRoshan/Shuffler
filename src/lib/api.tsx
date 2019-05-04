import Reddit from '../secrets/Reddit'; // NOTE: this is gitignored for obvious reasons
import AsyncStorage from '@react-native-community/async-storage';

const USER_AGENT = 'react-native:shuffler:v0.0.1 (by /u/cyrusroshan)';
const BASE_URL = 'https://oauth.reddit.com';
const REFRESH_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const CLIENT_ID = 'NYDEcwiXOz1XPw';
const REDIRECT_URI = 'shuffler://settings';

const TOKEN_KEY = 'SERIALIZED-TOKENS';

var Tokens = {
  AuthToken: '',
}

const getAuthToken = async () => {
  if (Tokens.AuthToken) {
    return Tokens.AuthToken;
  }
  var t = await AsyncStorage.getItem(TOKEN_KEY);
  if (t === null) {
    throw('tokens do not exist')
  }

  Tokens = JSON.parse(t);
  return Tokens.AuthToken;
}

const unauthedRequest = {
  get: (url: string) => fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  }),

  post: (url: string, body: { [key: string]: string }) => fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    },
    body: JSON.stringify(body),
  }),
}

const authedRequest = {
  get: (url: string, auth: string) => fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
      Authorization: `bearer ${auth}`,
    },
  }).then(r => r.json()),

  post: (url: string, auth: string, body: { [key: string]: string }) => fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
      Authorization: `bearer ${auth}`,
    },
    body: JSON.stringify(body),
  }).then(r => r.json),
}

const api = {
  loginURL: function() {
    const state = btoa(Math.random().toString());
    return {
      state: state,
      url: `https://www.reddit.com/api/v1/authorize?client_id=${
        encodeURIComponent(CLIENT_ID)
      }&response_type=token&state=${
        encodeURIComponent(state)
      }&redirect_uri=${
        encodeURIComponent(REDIRECT_URI)
      }&duration=temporary&scope=history%20identity`,
    }
  },

  saveLogin: async function(authToken: string) {
    Tokens = {
      AuthToken: authToken,
    };
    return await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(Tokens))
  },

  isAuthed: async function() {
    if (Tokens.AuthToken) {
      return true;
    }
    var code = await AsyncStorage.getItem(TOKEN_KEY);
    if (code === null) {
      return false;
    }
    return true;
  },

  refresh: async function(refreshToken: string) {
    return await authedRequest.post(REFRESH_TOKEN_URL, await getAuthToken(), {
      'grant_type': 'refresh_token',
      'refresh_token': refreshToken,
    })
  },

  currentUser: async function() {
    return await authedRequest.get(BASE_URL + '/api/v1/me', await getAuthToken());
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

      return authedRequest.get(urlWithQuery, await getAuthToken());
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

function convertToQueryParamString(queries: {[key: string]: any}): string {
  let queryParamString = '?';
  for (const query in queries) {
    if (queries[query] === undefined) {
      continue;
    }

    queryParamString += encodeURIComponent(query);
    queryParamString += '=';
    queryParamString += encodeURIComponent(String(queries[query]));
    queryParamString += '&';
  }
  return queryParamString.substring(0, queryParamString.length - 1); // remove last '&' or initial '?'
}