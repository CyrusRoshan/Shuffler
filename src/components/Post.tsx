import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import Colors from '../constants/Colors';
import { storage } from '../lib/storage';

export interface PostData {
  url: string,
  author: string,
  title: string,
  subreddit: string,
  id: string,
  prefixed_id: string,
  permalink: string,
}

export const parsePost = (postData: any) => {
  return {
    url: postData.data.url,
    author: postData.data.author,
    title: postData.data.title,
    subreddit: postData.data.subreddit,
    id: postData.data.id,
    prefixed_id: postData.data.name,
    permalink: postData.data.permalink,
  } as PostData;
}

interface Props {
  data: PostData,
}

interface State {
  imageData: string,
  imageWidth?: number,
  imageHeight?: number,
}

export class Post extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      imageData: '',
    }
  }

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.getImageData();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  async fitImage() {
    Image.getSize(this.state.imageData, (width, height) => {
      const screenWidth = Dimensions.get('window').width;
      const scaleFactor = width / screenWidth;
      const imageHeight = height / scaleFactor;
      this.setState({
        imageWidth: screenWidth,
        imageHeight: imageHeight
      })
    }, console.error)
  }

  async getImageData() {
    // Get image data if it exists
    const imageData = await storage.postImageData().get(this.props.data.prefixed_id)
    if (imageData !== null) {
      if (this._isMounted) {
        this.setState({imageData}, this.fitImage);
      }
      return;
    }

    // Read image as data url
    const image = await fetch(this.props.data.url)
    const blob = await image.blob()
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
      reader.readAsDataURL(blob)
    })

    // Save and update image data
    if (this._isMounted) {
      this.setState({
        imageData: fetchedImageData
      }, this.fitImage);
    }
    storage.postImageData().save(this.props.data.prefixed_id, fetchedImageData);
  }

  render() {
    if (!this.state.imageData) {
      return <View style={{width: '100%', height: 400}}></View>
    }

    return (
      <>
        <View style={{ marginTop: 10 }}></View>
        <View>
          <Text style={styles.postTitle}
            numberOfLines={2}
            onPress={() => Linking.openURL("https://www.reddit.com" + this.props.data.permalink)}
          >{this.props.data.title}</Text>
          <View style={styles.container}>
            <Text style={styles.regularText}>u/{this.props.data.author}</Text>
            <Text style={styles.regularText}>r/{this.props.data.subreddit}</Text>
          </View>
          <Image style={
            {
              width: this.state.imageWidth || '100%',
              height: this.state.imageHeight || 400,
              resizeMode: 'cover',
              borderWidth: 1,
              borderColor: 'red'
            }
          } source={{ uri: this.state.imageData }} />
        </View>
        <View style={{ marginBottom: 30 }}></View>
      </>
    )
  }
}

const styles = StyleSheet.create({
  postTitle: {
    fontSize: 20,
    fontWeight: '900',

    textAlign: 'center',
    paddingHorizontal: 30,
    alignSelf: 'stretch',
    color: Colors.lightWhite,
  },

  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  regularText: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500',

    marginBottom: 0,

    textAlign: 'center',
    alignSelf: 'stretch',
    color: Colors.lightWhite,
  },

  linkText: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500',

    marginBottom: 0,

    textAlign: 'center',
    alignSelf: 'stretch',
    color: Colors.lightBlue
  },
});