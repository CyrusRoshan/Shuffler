import AsyncStorage from '@react-native-community/async-storage';
import { PostData } from '../components/Post';

const ERR_NULL_VALUE = 'error! null value save attempt!'

function prefix(pre: string, str: string) {
  return pre + '-' + str;
}

export interface ImageData {
  data: string,
  width: number,
  height: number,
}

export const storage = {
  irreversablyClearAllData: AsyncStorage.clear,

  settings: () => {
    const SETTINGS_PREFIX = 'SETTINGS';

    return {
      username: () => stringStorageTemplate(prefix(SETTINGS_PREFIX, "USERNAME")),
      savePostImages: () => boolStorageTemplate(prefix(SETTINGS_PREFIX, "SAVE_POST_IMAGES")),
      clickableLinks: () => boolStorageTemplate(prefix(SETTINGS_PREFIX, "CLICKABLE_LINKS")),
      debugInfo: () => boolStorageTemplate(prefix(SETTINGS_PREFIX, "DEBUG_INFO")),
      experimentalVideoSupport: () => boolStorageTemplate(prefix(SETTINGS_PREFIX, "VIDEO_SUPPORT")),
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
      },

      deleteFrom: async function (postID: string) {
        const savedPostIDs = await this.get()
        if (savedPostIDs) {
          const filteredPostIDs = savedPostIDs.filter((id) => id !== postID);
          this.save(filteredPostIDs);
          return true;
        }
        return false;
      },

      deleteALL: async function () {
        return await AsyncStorage.removeItem(PREFIX);
      }
    }
  },

  //
  // OFFLINE_POST_ID_LIST = []string (offline post IDs)
  //
  offlinePostIDList: () => {
    const PREFIX = 'OFFLINE_POST_ID_LIST';

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
      },

      deleteFrom: async function (postID: string) {
        const savedPostIDs = await this.get()
        if (savedPostIDs) {
          const filteredPostIDs = savedPostIDs.filter((id) => id !== postID);
          this.save(filteredPostIDs);
          return true;
        }
        return false;
      },

      deleteALL: async function () {
        return await AsyncStorage.removeItem(PREFIX);
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

        return JSON.parse(postDataText) as PostData;
      },

      save: async function(postID: string, postData: PostData) {
        if (!postID || !postData) {
          throw(ERR_NULL_VALUE);
        }
        return await AsyncStorage.setItem(prefix(PREFIX, postID), JSON.stringify(postData));
      },

      delete: async function (postID: string) {
        return await AsyncStorage.removeItem(prefix(PREFIX, postID));
      }
    }
  },


  //
  // POST_IMAGE_DATA = string (post ID) => string (base64 image data)
  //
  imageData: () => {
    const PREFIX = 'POST_IMAGE_DATA';

    return {
      get: async function (postID: string): Promise<ImageData|undefined> {
        const imageDataString = await AsyncStorage.getItem(prefix(PREFIX, postID));
        if (!imageDataString) {
          return undefined;
        }

        return JSON.parse(imageDataString) as ImageData;
      },

      save: async function (postID: string, imageData: ImageData) {
        if (!postID || !imageData) {
          throw (ERR_NULL_VALUE);
        }

        const serialized = JSON.stringify(imageData);
        return await AsyncStorage.setItem(prefix(PREFIX, postID), serialized);
      },

      delete: async function (postID: string) {
        return await AsyncStorage.removeItem(prefix(PREFIX, postID));
      }
    }
  },
}

const stringStorageTemplate = (key: string) => {
  return {
    save: async function (value: string) {
      if (!value) {
        throw (ERR_NULL_VALUE)
      }
      return await AsyncStorage.setItem(key, value);
    },

    get: async function () {
      return await AsyncStorage.getItem(key);
    },

    delete: async function () {
      return await AsyncStorage.removeItem(key);
    }
  }
}

const boolStorageTemplate = (key: string) => {
  return {
    save: async function (value: boolean) {
      if (value === undefined || value === null) {
        throw (ERR_NULL_VALUE)
      }
      return await AsyncStorage.setItem(key, JSON.stringify(value));
    },

    get: async function () {
      const value = await AsyncStorage.getItem(key);
      if (!value) {
        return false;
      }
      return Boolean(JSON.parse(value));
    },

    delete: async function () {
      return await AsyncStorage.removeItem(key);
    }
  }
}