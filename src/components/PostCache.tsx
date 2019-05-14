import { Image, Dimensions } from 'react-native';
import { PostData } from './Post';
import { storage, ImageData } from '../lib/storage';

interface Props {
  postData: PostData[],
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
  async get(index: number) {
    // Check cache
    const cached = this.state.cache[index]
    if (cached) {
      return cached;
    }

    console.log("MISSED T1", index)

    // Check saved disk
    const postData = this.props.postData[index];
    const saved = await storage.imageData().get(postData.prefixed_id);
    if (saved) {
      this.state.cache[index] = saved;
      return saved;
    }

    console.log("MISSED T2", index)

    // Check URL
    const fetched = await this.getFromURL(postData.url);
    if (fetched) {
      await storage.imageData().save(postData.prefixed_id, fetched);
      this.state.cache[index] = saved;
      return fetched
    }

    // Error if reached here
    throw(`Could not fetch ${postData.url}`)
  }

  async getFromURL(url: string): Promise<ImageData|undefined> {
    // Read image as data url
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

    // Get image size
    const imageSize = await this.imageSize(fetchedImageData);

    return {
      width: imageSize.width,
      height: imageSize.height,
      data: fetchedImageData,
    };
  }

  async imageSize(imageData: string): Promise<{width: number, height: number}> {
    return new Promise((resolve, reject) => {
      Image.getSize(imageData, (width, height) => {
        resolve({width, height});
      }, reject)
    })
  }
}