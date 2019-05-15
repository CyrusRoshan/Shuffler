import { throwErrOrParseJSON, keyPair, convertBody } from "./utils";
const base64 = require('base-64');

const USER_AGENT = 'react-native:shuffler:v0.0.1 (by /u/cyrusroshan)';
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type Headers = { [s: string]: string; }

export const TokenRequest = {
  initialAuth: async (url: string, clientID: string, code: string) => {
    const body = `grant_type=authorization_code&code=${code}&redirect_uri=shuffler%3A%2F%2Fsettings`;
    return await tokenRequest(url, clientID, body);
  },

  refresh: async (url: string, clientID: string, refreshToken: string) => {
    const body = `grant_type=refresh_token&refresh_token=${refreshToken}`;
    return await tokenRequest(url, clientID, body);
  }
}

export const UnauthedRequest = (method: Method, url: string, body?: keyPair) => {
  return request(method, url, undefined, body);
}
export const AuthedRequest = (method: Method, url: string, auth: string, body?: keyPair) => {
  return request(method, url, `bearer ${auth}`, body);
}

const request = async (method: Method, url: string, auth?: string, body?: keyPair) => {
  var headers = {
    Accept: 'application/json',
    'User-Agent': USER_AGENT,
  } as Headers;

  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    headers['Authorization'] = auth;
  }

  return fetch(url, {
    method: method,
    headers,
    body: body ? convertBody(body) : undefined,
  }).then(throwErrOrParseJSON);
}

const tokenRequest = async (url: string, clientID: string, body: string) => {
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
      'Authorization': `Basic ${base64.encode(clientID + ':')}`,
    },
    body: body,
  }).then(throwErrOrParseJSON)
}