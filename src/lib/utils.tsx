export function convertToQueryParamString(queries: { [key: string]: any }): string {
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

export interface keyPair { [key: string]: string };
export function convertBody(body: keyPair) {
  var newBody = {} as keyPair;

  for (var key in body) {
    const newKey = encodeURIComponent(key);
    const newVal = encodeURIComponent(body[key]);

    newBody[newKey] = newVal;
  }

  return JSON.stringify(newBody)
}

export async function throwErrOrParseJSON(resp: Response) {
  if (!resp.ok) {
    const body = await resp.text();
    throw (`response error: ${resp.status}, ${body}}`)
  }
  return { response: resp, json: await resp.json() };
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  })
}

export function updater(min: number, max: number, maxIncrements: number, updateFunc: (c: number) => void) {
  var increments = 0;
  return () => {
    increments += 1;
    const current = (max - min) * (increments / maxIncrements) + min;
    updateFunc(current);
  }
}