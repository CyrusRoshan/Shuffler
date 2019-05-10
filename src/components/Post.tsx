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
import { getReadableDateSince } from '../lib/utils';

export interface PostData {
  url: string,
  author: string,
  title: string,
  subreddit: string,
  id: string,
  prefixed_id: string,
  permalink: string,
  created_utc: number,
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
    created_utc: postData.data.created_utc,
  } as PostData;
}

interface Props {
  data: PostData,
  clickableLinks: boolean
  savePostImages: boolean
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
      if (this._isMounted) {
        this.setState({
          imageWidth: screenWidth,
          imageHeight: imageHeight
        })
      }
    }, console.error)
  }

  async getImageData() {
    // Get image data if it exists
    const imageData = await storage.postImageData().get(this.props.data.prefixed_id)
    if (imageData !== null) {
      if (this._isMounted) {
        this.setState({ imageData }, this.fitImage);
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
    if (this.props.savePostImages) {
      storage.postImageData().save(this.props.data.prefixed_id, fetchedImageData);
    }
  }

  render() {
    if (!this.state.imageData) {
      return <View style={{ width: '100%', height: 400 }}></View>
    }

    const clickFunc = (path: string) => () => {
      if (this.props.clickableLinks) {
        Linking.openURL("https://www.reddit.com" + path);
      }
    }

    const timeDiff = Date.now() - this.props.data.created_utc * 1000; // This date is in s not ms
    const readableTimeDiff = getReadableDateSince(timeDiff);
    return (
      <>
        <View style={{ marginTop: 5 }}></View>
        <View>
          <View style={{
            paddingTop: 5,
            paddingHorizontal: 5,
          }}>
            <Text style={styles.postTitle}
              adjustsFontSizeToFit={true}
              numberOfLines={3}
              onPress={clickFunc(this.props.data.permalink)}>{this.props.data.title}</Text>
            <View style={styles.container}>
              <Text style={styles.regularText}
                onPress={clickFunc("/u/" + this.props.data.author)}>u/{this.props.data.author}</Text>

              <Text style={styles.regularText}
                onPress={clickFunc("/r/" + this.props.data.subreddit)}>r/{this.props.data.subreddit}</Text>

              <View style={styles.container}>
                <Feather style={styles.regularText} name='clock' size={35} color={Colors.white} />
                <Text style={styles.regularText}> {readableTimeDiff} ago</Text>
              </View>
            </View>
          </View>
          <Image style={
            {
              width: this.state.imageWidth || '100%',
              height: this.state.imageHeight || 400,
              resizeMode: 'cover',
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