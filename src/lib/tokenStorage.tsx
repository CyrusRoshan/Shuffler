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
  d.setSeconds(d.getSeconds() + Number(refreshTime) - 5); // Decrement just in case of latency when recieving message
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
  if (now > tokens.RefreshDate) {
    console.log("AUTOMATICALLY REFRESHING THE TOKENS")
    RefreshTokens();
  }
  const timeDiff = tokens.RefreshDate.getTime() - now.getTime();
  console.log(`Time before token in seconds: ${Math.floor(timeDiff / 1000)}. In minutes: ${Math.floor(timeDiff / 1000 / 60)}`);

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