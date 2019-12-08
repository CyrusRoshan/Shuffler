import { Image } from 'react-native';
import { PostData } from '../lib/postdata';
import { storage, ImageData } from '../lib/storage';
import api from '../lib/api';

interface Props {
  postIDs: string[],

  videoSupport?: boolean,
  offline?: boolean,
  saveForOffline?: boolean,
}

// TODO: try this as a KV pair, then use it as a global object incorporated into storage, if it improves speed.
interface State {

}

// Not really a react component because it doesn't get rendered
export class PostCache {
  props = {} as Props;
  state = {} as State;

  constructor(props: Props) {
    this.props = props;
  }

  postDataCache: Record<string, (PostData | undefined)> = {};
  imageDataCache: Record<string, (ImageData | undefined)> = {};

  async deletePost(id: string, prefixed_id: string) {
    // Delete from disk
    storage.imageData().delete(prefixed_id);
    storage.postData().delete(prefixed_id);
    storage.postIDList.deleteFrom(prefixed_id);
    storage.offlinePostIDList.deleteFrom(prefixed_id);
    delete this.postDataCache[id];
    delete this.imageDataCache[id];
    api.call().unsave(prefixed_id);
  }

  async getPostData(postID: string): Promise<PostData|undefined> {
    const cached = this.postDataCache[postID];
    if (cached) {
      return cached;
    }

    const data = await storage.postData().get(postID);
    if (!data) {
      return;
    }
    if (data.type === 'video' && !this.props.videoSupport) {
      return;
    }

    this.postDataCache[postID] = data
    return data;
  }

  // either get from cache (fast)
  // get from saved disk (slow)
  // or get from url (slower)
  async getImageData(postID: string): Promise<ImageData|undefined> {
    // Check cache
    const cached = this.imageDataCache[postID]
    if (cached) {
      return cached;
    }

    // Get postdata
    const postData = await this.getPostData(postID);
    if (!postData) {
      return;
    }
    // Check saved disk
    const saved = await storage.imageData().get(postData.prefixed_id);
    if (saved) {
      this.imageDataCache[postID] = saved;
      return saved;
    }

    if (this.props.offline) {
      return;
    }

    // Check URL
    const fetched = await this.getImageDataFromURL(postData.dataURL);
    if (fetched) {
      // Offline save
      if (this.props.saveForOffline) {
        storage.imageData().save(postData.prefixed_id, fetched);
        storage.offlinePostIDList.add([postData.prefixed_id])
      }
      this.imageDataCache[postID] = fetched;
      return fetched
    }

    // Error if reached here
    throw(`Could not fetch ${postData.dataURL}`)
  }

  async getImageDataFromURL(url: string): Promise<ImageData|undefined> {
    const fetchedImageData = await this.imageBlob(url);
    const imageSize = await this.imageSize(fetchedImageData);

    return {
      width: imageSize.width,
      height: imageSize.height,
      data: fetchedImageData,
    };
  }

  // Read image as data url
  async imageBlob(url: string) {
    const imageBlob = await fetch(url).then(i => i.blob());
    const fetchedImageData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result)
          return
        }
        reject(reader.result)
      }
      reader.onerror = reject
      reader.readAsDataURL(imageBlob)
    })
    return fetchedImageData;
  }

  async imageSize(imageData: string): Promise<{width: number, height: number}> {
    return new Promise((resolve, reject) => {
      Image.getSize(imageData, (width, height) => {
        resolve({width, height});
      }, reject)
    })
  }
}