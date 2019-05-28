import React from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';

import Swipeout from 'react-native-swipeout';
import Feather from 'react-native-vector-icons/Feather';
import Video from 'react-native-video';

import Colors from '../constants/Colors';
import { getReadableTimeSince } from '../lib/utils';
import { PostCache } from './PostCache';
import { storage } from '../lib/storage';
import api from '../lib/api';

export type PostType = 'image' | 'video'
export interface PostData {
  url: string,
  dataURL: string,
  author: string,
  title: string,
  subreddit: string,
  id: string,
  prefixed_id: string,
  permalink: string,
  created_utc: number,
  type: PostType,
}

export const ParsePost = (data: any): PostData|undefined => {
  // Verify bare minimum data
  if (
    !data.url ||
    !data.author ||
    !data.title ||
    !data.subreddit ||
    !data.id ||
    !data.name ||
    !data.permalink ||
    !data.created_utc
  ) {
    return undefined;
  }
  data.prefixed_id = data.name;

  // Assign type
  var type: PostType|undefined;
  if (data.post_hint === 'image') {
    data.dataURL = data.url;
    type = 'image';
  }
  else if (
    String(data.url).endsWith(".jpg") ||
    String(data.url).endsWith(".png") ||
    String(data.url).endsWith(".jpeg")
  ) {
    data.dataURL = data.url;
    type = 'image';
  }
  else if (
    data.secure_media &&
    data.secure_media.reddit_video &&
    data.secure_media.reddit_video.fallback_url
  ) {
    data.dataURL = data.secure_media.reddit_video.fallback_url;
    type = 'video';
  }
  else if (data.post_hint === 'hosted:video') {
    data.dataURL = data.url;
    type = 'video';
  }
  else if (
    data.preview &&
    data.preview.reddit_video_preview &&
    data.preview.reddit_video_preview.fallback_url
  ) {
    data.dataURL = data.preview.reddit_video_preview.fallback_url;
    type = 'video';
  }

  // Check type was assigned
  if (!type) {
    return undefined;
  }
  data.type = type;

  return data as PostData;
}

interface Props {
  index: number,
  cache: PostCache,

  data: PostData,

  linkPrefix: string,
  clickableLinks: boolean
  swipeOut: boolean
  savePostImages: boolean
}

interface State {
  hidden?: boolean,
  rawImg?: string,
  imageHeight?: number,

  animVal: Animated.Value
}

export class Post extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      animVal: new Animated.Value(0),
    }
  }

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    if (this.props.data.type === 'image') {
      this.getImageData();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Get base64 imagedata and image size for render
  async getImageData() {
    const imageData = await this.props.cache.get(this.props.index);
    if (!imageData) {
      this.setState({
        hidden: true
      })
      return;
    }

    // Size image
    const screenWidth = Dimensions.get('window').width;
    const scaleFactor = imageData.width / screenWidth;
    const imageHeight = imageData.height / scaleFactor;

    if (this._isMounted) {
      this.setState({
        rawImg: imageData.data,
        imageHeight,
      })
    }
  }

  clickFunc = (path: string) => () => {
    if (this.props.clickableLinks) {
      Linking.openURL(this.props.linkPrefix + path);
    }
  }

  removePost(callback?: Function) {
    return new Promise(resolve => {
      Animated.timing(this.state.animVal, {
        toValue: 1,
        duration: 500,
      }).start(async () => {
        // Delete from disk
        storage.imageData().delete(this.props.data.prefixed_id);
        storage.postData().delete(this.props.data.prefixed_id);
        storage.postIDList.deleteFrom(this.props.data.prefixed_id);
        storage.offlinePostIDList.deleteFrom(this.props.data.prefixed_id);

        // Stop rendering
        this.setState({
          hidden: true,
        }, resolve)
      });
    });
  }

  async deletePost() {
    await this.removePost();

    // Also unsave from reddit
    api.call().unsave(this.props.data.prefixed_id);
  }

  swipeoutButtons = [
    {
      text: "Uncache",
      color: Colors.white,
      backgroundColor: Colors.lightOrange,
      underlayColor: Colors.darkOrange,
      onPress: this.removePost.bind(this),
    },
    {
      text: "Delete",
      color: Colors.white,
      backgroundColor: Colors.lightRed,
      underlayColor: Colors.darkRed,
      onPress: this.deletePost.bind(this),
    },
  ]

  readableTimeDiff = getReadableTimeSince(this.props.data.created_utc * 1000); // This date is in s not ms

  render() {
    if (this.state.hidden) {
      return <></>;
    }
    if (this.props.data.type === 'image' && !this.state.rawImg) {
      return <View style={styles.imagePlaceholder}></View>;
    }

    const title = (
      <Text style={styles.postTitle}
        adjustsFontSizeToFit={true}
        numberOfLines={4}
        onPress={this.clickFunc(this.props.data.permalink)}>{this.props.data.title}</Text>
    );
    const postInfo = (
      <View style={styles.container}>
        <Text
          style={[styles.containerElement, styles.regularText, styles.descLinks, { color: Colors.darkGreen }]}
          onPress={this.clickFunc("/u/" + this.props.data.author)}>u/{this.props.data.author}</Text>

        <Text
          style={[styles.containerElement, styles.regularText, styles.descLinks, { color: Colors.darkYellow }]}
          onPress={this.clickFunc("/r/" + this.props.data.subreddit)}>r/{this.props.data.subreddit}</Text>

        <View style={[styles.containerElement, { flexDirection: 'row', justifyContent: 'center' }, styles.descLinks]}>
          <Feather style={[styles.regularText, { color: Colors.darkWhite }]} name='clock' size={30} />
          <Text style={[styles.regularText, { color: Colors.darkWhite }]}> {this.readableTimeDiff} ago</Text>
        </View>
      </View>
    );

    var postContent;
    if (this.props.data.type === 'image') {
      postContent = (
        <View style={{ width: '100%', backgroundColor: Colors.lightBlack }}>
          <Image style={{
              flex: 1,
              width: '100%',
              height: this.state.imageHeight || 200,
              resizeMode: 'cover',
            }} source={{ uri: this.state.rawImg }} />
        </View>
      );
    } else if (this.props.data.type === 'video') {
      postContent = (
        <View style={{ width: '100%', backgroundColor: Colors.lightBlack }}>
          <Video source={{ uri: this.props.data.dataURL }}   // Can be a URL or a local file.
            controls={true}
            style={{
              flex: 1,
              width: '100%',
              aspectRatio: 1,
            }}
            repeat={true}
            resizeMode={'cover'}
          />
        </View>
      );
    }

    const content = (
      <>
        <View style={{
          paddingTop: 5,
          paddingHorizontal: 5,
        }}>
          {title}
          {postInfo}
        </View>
        { postContent }
      </>
    )

    if (!this.props.swipeOut) {
      return <View style={styles.rootContainer}>
        {content}
      </View>
    }

    return (
      <Animated.View style={[styles.rootContainer, {
          left: this.state.animVal.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '-200%']  // 0 : 150, 0.5 : 75, 1 : 0
          }),
          maxHeight: this.state.animVal.interpolate({
            inputRange: [0, 1],
            outputRange: ['100%', '0%']  // 0 : 150, 0.5 : 75, 1 : 0
          }),
        }]}>
          <Swipeout
            backgroundColor={'transparent'}
            sensitivity={-1000}
            right={this.swipeoutButtons}>
            {content}
          </Swipeout>
        </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    marginTop: 5,
    marginBottom: 10,

    borderBottomColor: Colors.black,
    borderBottomWidth: 2,
  },

  imagePlaceholder: {
    width: '100%',
    height: 400
  },

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
    flexWrap: 'wrap',
  },

  containerElement: {
    paddingLeft: 5,
    paddingRight: 5,
  },

  descLinks: {
    // flex: 1,
    // flexShrink: 0,
  },

  regularText: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '400',

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