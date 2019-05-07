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

export async function throwErrOrParseJSON(r: Response) {
  if (!r.ok) {
    const body = await r.text();
    throw (`response error: ${r.status}, ${body}`)
  }
  return { response: r, json: await r.json() };
}