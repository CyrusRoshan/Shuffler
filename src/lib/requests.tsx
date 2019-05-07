import { throwErrOrParseJSON, keyPair, convertBody } from "./utils";

export const USER_AGENT = 'react-native:shuffler:v0.0.1 (by /u/cyrusroshan)';

export const tokenRequest = {
  initialAuth: async (url: string, clientID: string, code: string) => {
    const body = `grant_type=authorization_code&code=${code}&redirect_uri=shuffler%3A%2F%2Fsettings`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
        'Authorization': `Basic ${btoa(clientID + ':')}`,
      },
      body: body,
    }).then(throwErrOrParseJSON)
    return res;
  },

  refresh: async (url: string, clientID: string, refreshToken: string) => {
    const body = `grant_type=refresh_token&refresh_token=${refreshToken}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
        'Authorization': `Basic ${btoa(clientID + ':')}`,
      },
      body: body,
    }).then(throwErrOrParseJSON)
    return res;
  }
}

export const unauthedRequest = {
  get: (url: string) => fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  }).then(throwErrOrParseJSON),

  post: (url: string, body: keyPair) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: convertBody(body),
    }).then(throwErrOrParseJSON)
  },
}

export const authedRequest = {
  get: (url: string, auth: string) => fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
      Authorization: `bearer ${auth}`,
    },
  }).then(throwErrOrParseJSON),

  post: (url: string, auth: string, body: keyPair) => fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
      Authorization: `bearer ${auth}`,
    },
    body: convertBody(body),
  }).then(throwErrOrParseJSON),
}