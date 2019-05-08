import AsyncStorage from '@react-native-community/async-storage';
import api from './api';
const TOKEN_KEY = 'SERIALIZED-TOKENS';

var Tokens = {
  AuthToken: '',
  RefreshToken: '',
  RefreshDate: new Date(),
};

export const SaveTokens = async (authToken: string, refreshToken: string, refreshTime: string) => {
  Tokens.AuthToken = authToken;
  Tokens.RefreshToken = refreshToken;

  var d = new Date()
  d.setSeconds(d.getSeconds() + Number(refreshTime));
  Tokens.RefreshDate =  d;

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

export const RefreshTokens = async function() {
  const tokens = await getTokens();
  const refreshData = await api.refresh(tokens.RefreshToken);

  await SaveTokens(refreshData.accessToken, tokens.RefreshToken, refreshData.expires_in)
  return getTokens();
}

export const GetTokens = async function() {
  const tokens = await getTokens();

  const now = new Date();
  if (tokens.RefreshDate > now) {
    RefreshTokens();
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

  Tokens = JSON.parse(t);
  return Tokens;
}