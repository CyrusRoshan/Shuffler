export const USER_AGENT = 'react-native:shuffler:v0.0.1 (by /u/cyrusroshan)';

interface keyPair { [key: string]: string };

export const unauthedRequest = {
  get: (url: string) => fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  }).then(r => r.json()),

  post: (url: string, body: keyPair, additionalHeaders?: keyPair) => {
    var headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
    } as keyPair;

    if (additionalHeaders) {
      for (var key in additionalHeaders) {
        headers[key] = additionalHeaders[key];
      };
    }

    console.log(headers)

    return fetch(url, {
      method: 'POST',
      headers: headers,
      body: convertBody(body),
    }).then(r => r.json())
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
  }).then(r => r.json()),

  post: (url: string, auth: string, body: keyPair) => fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
      Authorization: `bearer ${auth}`,
    },
    body: convertBody(body),
  }).then(r => r.json),
}

function convertBody(body: keyPair) {
  var newBody = {} as keyPair;

  for (var key in body) {
    const newKey = encodeURIComponent(key);
    const newVal = encodeURIComponent(body[key]);

    newBody[newKey] = newVal;
  }

  return JSON.stringify(newBody)
}