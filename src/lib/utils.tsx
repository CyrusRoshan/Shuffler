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

// Fisher-Yates shuffle
export function shuffle(arr: any[]) {
  for (var i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
}

// Simple reorder
export function reorder(arr: any[]) {
  var split = Math.floor(Math.random() * (arr.length + 1));
  arr.unshift(...arr.splice(split, arr.length - split));
}

export function getReadableTimeSince(dateInMs: number) {
  const now = Date.now();
  return getReadableTime(now - dateInMs);
}

export function getReadableTimeUntil(dateInMs: number) {
  const now = Date.now();
  return getReadableTime(dateInMs - now);
}

export function getReadableTime(timeInMs: number) {
  const times =    ["ms", "s", "min", "hrs", "d", "mo", "y"];
  const divisors = [1000, 60, 60, 24, 30, 12];

  var curr = timeInMs;
  var i = 0
  for (; i < divisors.length; i++) {
    const rounded = Math.round(curr / divisors[i]);
    if (rounded < 1) {
      break;
    }
    curr = rounded;
  }
  return `${curr}${times[i]}`
}