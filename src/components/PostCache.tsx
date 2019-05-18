import { Image } from 'react-native';
import { PostData } from './Post';
import { storage, ImageData } from '../lib/storage';

interface Props {
  postData: PostData[],
  offline?: boolean,
  saveForOffline?: boolean,
}

// TODO: try this as a KV pair, then use it as a global object incorporated into storage, if it improves speed.
interface State {
  cache: (ImageData|undefined)[]
}

// Not really a react component because it doesn't get rendered
export class PostCache {
  props = {} as Props;
  state = {} as State;

  constructor(props: Props) {
    this.props = props;
    this.state = {
      cache: new Array(props.postData.length),
    }
  }

  // either get from cache (fast)
  // get from saved disk (slow)
  // or get from url (slower)
  async get(index: number): Promise<ImageData|undefined> {
    // Check cache
    const cached = this.state.cache[index]
    if (cached) {
      return cached;
    }

    // Get postdata from initial array
    const postData = this.props.postData[index];

    // Check saved disk
    const saved = await storage.imageData().get(postData.prefixed_id);
    if (saved) {
      this.state.cache[index] = saved;
      return saved;
    }

    if (this.props.offline) {
      return undefined;
    }

    // Check URL
    const fetched = await this.getFromURL(postData.dataURL);
    if (fetched) {
      // Offline save
      if (this.props.saveForOffline) {
        storage.imageData().save(postData.prefixed_id, fetched);
        storage.offlinePostIDList.add([postData.prefixed_id])
      }
      this.state.cache[index] = fetched;
      return fetched
    }

    // Error if reached here
    throw(`Could not fetch ${postData.dataURL}`)
  }

  async getFromURL(url: string): Promise<ImageData|undefined> {
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