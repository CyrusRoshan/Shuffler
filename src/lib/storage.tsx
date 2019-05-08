import AsyncStorage from '@react-native-community/async-storage';
import { PostData } from '../components/Post';

const ERR_NULL_VALUE = 'error! null value save attempt!'

function prefix(pre: string, str: string) {
  return pre + '-' + str;
}

// TODO: use this instead of storage.username
export interface Settings {
  // Username
  username: string,

  // Whether or not to save base64 image data
  // TODO: saveImages: string,

  // TODO: DarkMode
  // TODO:
}

export const storage = {
  username: () => {
    const PREFIX = 'USERNAME';

    return {
      save: async function(name: string) {
        if (!name) {
          throw(ERR_NULL_VALUE)
        }
        return await AsyncStorage.setItem(PREFIX, name);
      },

      get: async function() {
        return await AsyncStorage.getItem(PREFIX);
      }
    }
  },

  //
  // POST_ID_LIST = []string (post IDs)
  //
  postIDList: () => {
    const PREFIX = 'POST_ID_LIST';

    return {
      get: async function() {
        const postIdText = await AsyncStorage.getItem(PREFIX);
        if (!postIdText) {
          return null;
        }

        return JSON.parse(postIdText) as string[];
      },

      add: async function(postIDs: string[]) {
        if (postIDs.length === 0) {
          throw(ERR_NULL_VALUE)
        }

        const savedPostIDs = await this.get()
        if (savedPostIDs) {
          postIDs = [...new Set([...savedPostIDs, ...postIDs])];
        }

        return await this.save(postIDs);
      },

      save: async function(postIDs: string[]) {
        return await AsyncStorage.setItem(PREFIX, JSON.stringify(postIDs));
      }
    }
  },

  //
  // POST_DATA = string (post ID) => object (postData)
  //
  postData: () => {
    const PREFIX = 'POST_DATA';

    return {
      get: async function(postID: string) {
        const postDataText = await AsyncStorage.getItem(prefix(PREFIX, postID));
        if (!postDataText) {
          return null;
        }

        return JSON.parse(postDataText) as PostData[];
      },

      save: async function(postID: string, postData: PostData) {
        if (!postID || !postData) {
          throw(ERR_NULL_VALUE);
        }
        return await AsyncStorage.setItem(prefix(PREFIX, postID), JSON.stringify(postData));
      },
    }
  },


  //
  // POST_IMAGE_DATA = string (post ID) => string (base64 image data)
  //
  postImageData: () => {
    const PREFIX = 'POST_IMAGE_DATA';

    return {
      get: async function (postID: string) {
        const imageData = await AsyncStorage.getItem(prefix(PREFIX, postID));
        if (!imageData) {
          return null;
        }

        return imageData;
      },

      save: async function (postID: string, imageData: string) {
        if (!postID || !imageData) {
          throw (ERR_NULL_VALUE);
        }

        return await AsyncStorage.setItem(prefix(PREFIX, postID), imageData);
      },
    }
  },
}