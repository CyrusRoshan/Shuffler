import AsyncStorage from '@react-native-community/async-storage';
import { getReadableTimeUntil } from './utils';
const TOKEN_KEY = 'SERIALIZED-TOKENS';

export interface TokenHolder {
  AuthToken: string,
  RefreshToken: string,
  RefreshDate: Date,
}

export interface RefreshTokenInfo {
  accessToken: string,
  expires_in: string,
}

export interface apiRefreshFunc{
  (refreshToken: string): Promise<RefreshTokenInfo>
}

var Tokens = {
  AuthToken: '',
  RefreshToken: '',
  RefreshDate: new Date(),
} as TokenHolder;

export const SaveTokens = async (authToken: string, refreshToken: string, secsUntilExp: number) => {
  Tokens.AuthToken = authToken;
  Tokens.RefreshToken = refreshToken;

  const expDate = new Date(Date.now() + (secsUntilExp * 1000) - 5000); // Decrement just in case of latency when recieving message
  Tokens.RefreshDate = expDate;

  return await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(Tokens))
}

export const DeleteTokens = async () => {
  Tokens = {
    AuthToken: '',
    RefreshToken: '',
    RefreshDate: new Date(),
  };
  return await AsyncStorage.removeItem(TOKEN_KEY)
}

export const TokensExist = async function() {
  try {
    await getTokens();
    return true;
  } catch (e) {
    return false;
  };
}

export const RefreshTokens = async function(apiRefresh: apiRefreshFunc) {
  const tokens = await getTokens();
  const refreshData = await apiRefresh(tokens.RefreshToken);

  await SaveTokens(refreshData.accessToken, tokens.RefreshToken, Number(refreshData.expires_in)) // Reddit stores this in S not MS
  return getTokens();
}

export const GetTokens = async function(apiRefresh: apiRefreshFunc) {
  const tokens = await getTokens();
  console.log(`Pre-refresh: Time before token expires: ${getReadableTimeUntil(tokens.RefreshDate.getTime())}`);

  const now = new Date();
  if (now > tokens.RefreshDate) {
    console.log("AUTOMATICALLY REFRESHING THE TOKENS")
    return await RefreshTokens(apiRefresh);
  }

  return tokens;
}

const getTokens = async function() {
  if (Tokens.AuthToken && Tokens.RefreshToken) {
    return Tokens;
  }

  var t = await AsyncStorage.getItem(TOKEN_KEY);
  if (t === null) {
    throw('tokens do not exist');
  }

  const parsedT = JSON.parse(t);
  Tokens = {
    AuthToken: parsedT.AuthToken,
    RefreshToken: parsedT.RefreshToken,
    RefreshDate: new Date(parsedT.RefreshDate),
  }

  return Tokens;
}