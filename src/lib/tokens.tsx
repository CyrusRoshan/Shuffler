import AsyncStorage from '@react-native-community/async-storage';
const TOKEN_KEY = 'SERIALIZED-TOKENS';

var Tokens = {
  AuthToken: '',
  RefreshToken: '',
};

export const saveTokens = async (authToken: string, refreshToken: string) => {
  Tokens.AuthToken = authToken;
  Tokens.RefreshToken = refreshToken;
  return await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(Tokens))
}

export const deleteTokens = async () => {
  Tokens = {
    AuthToken: '',
    RefreshToken: '',
  };
  return await AsyncStorage.removeItem(TOKEN_KEY)
}

export const tokensExist = async function() {
  try {
    await getTokens();
    return true;
  } catch (e) {
    return false;
  };
}

export const getTokens = async function() {
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