import Reddit from '../secrets/Reddit'; // NOTE: this is gitignored for obvious reasons

const USER_AGENT = 'react-native:shuffler:v0.0.1 (by /u/cyrusroshan)';
const BASE_URL = 'https://oauth.reddit.com';
const REFRESH_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const CLIENT_ID = 'NYDEcwiXOz1XPw';

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
  refresh: function(refreshToken: string) {
    return authedRequest.post(REFRESH_TOKEN_URL, Reddit.exampleUser.access_token, {
      'grant_type': 'refresh_token',
      'refresh_token': refreshToken,
    })
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

    const userFetch = function(pathSuffix: string, props: userProps) {
      const url = BASE_URL + `/user/${username}/${pathSuffix}`

      const urlWithQuery = url + convertToQueryParamString(props);
      console.log(urlWithQuery)

      return authedRequest.get(urlWithQuery, Reddit.exampleUser.access_token);
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