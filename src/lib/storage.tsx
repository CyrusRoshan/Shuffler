import AsyncStorage from '@react-native-community/async-storage';
import { PostData } from '../components/Post';
import { Mutex } from 'async-mutex';

const ERR_NULL_VALUE = 'error! null value save attempt!'

const stringArrayStorageTemplate = (key: string) => {
  const mutex = new Mutex();
  return {
    get: async function () {
      const savedArr = await AsyncStorage.getItem(key);

      if (!savedArr) {
        return null;
      }
      return JSON.parse(savedArr) as string[];
    },

    add: async function (arr: string[]) {
      const release = await mutex.acquire();
      if (arr.length === 0) {
        throw (ERR_NULL_VALUE)
      }

      const savedArr = await this.get();
      if (savedArr) {
        arr = [...new Set([...savedArr, ...arr])];
      }

      await this.save(arr);
      release();
    },

    save: async function (arr: string[]) {
      await AsyncStorage.setItem(key, JSON.stringify(arr));
    },

    deleteFrom: async function (postID: string) {
      const release = await mutex.acquire();
      const savedArr = await this.get()
      if (!savedArr) {
        return;
      }

      const filteredArr = savedArr.filter((id) => id !== postID);
      await this.save(filteredArr);
      release();
      return;
    },

    deleteALL: async function () {
      await AsyncStorage.removeItem(key);
    }
  }
}

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
      swipeOut: () => boolStorageTemplate(prefix(SETTINGS_PREFIX, "SWIPEOUT")),
    }
  },

  //
  // POST_ID_LIST = []string (post IDs)
  //
  postIDList: stringArrayStorageTemplate('POST_ID_LIST'),
  offlinePostIDList: stringArrayStorageTemplate('OFFLINE_POST_ID_LIST'),

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