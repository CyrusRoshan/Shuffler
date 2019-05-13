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

import Colors from '../constants/Colors';
import { getReadableTimeSince } from '../lib/utils';
import { PostCache } from './PostCache';
import { storage } from '../lib/storage';
import api from '../lib/api';

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
  index: number,
  cache: PostCache,

  data: PostData,

  clickableLinks: boolean
  savePostImages: boolean
}

interface State {
  deleted?: boolean,
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
    this.getImageData();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Get base64 imagedata and image size for render
  async getImageData() {
    const imageData = await this.props.cache.get(this.props.index);

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
      Linking.openURL("https://www.reddit.com" + path);
    }
  }

  deletePost() {
    Animated.timing(this.state.animVal, {
      toValue: 1,
      duration: 500,
    }).start(() => {
      // TODO: delete from reddit API
      storage.imageData().delete(this.props.data.prefixed_id);
      storage.postData().delete(this.props.data.prefixed_id);
      storage.postIDList().deleteFrom(this.props.data.prefixed_id);
    });
  }

  swipeoutButtons = [
    {
      text: 'Delete',
      backgroundColor: Colors.lightRed,
      underlayColor: Colors.darkRed,
      color: Colors.lightWhite,
      onPress: this.deletePost.bind(this),
    }
  ]

  readableTimeDiff = getReadableTimeSince(this.props.data.created_utc * 1000); // This date is in s not ms

  render() {
    if (this.state.deleted) {
      return <></>;
    }
    if (!this.state.rawImg) {
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
    const postImage = (
      <View style={{ width: '100%', backgroundColor: Colors.lightBlack }}>
        <Image style={{
            flex: 1,
            width: '100%',
            height: this.state.imageHeight || 200,
            resizeMode: 'cover',
          }} source={{ uri: this.state.rawImg }} />
      </View>
    );

    return (
      <Animated.View style={{
        left: this.state.animVal.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', '-200%']  // 0 : 150, 0.5 : 75, 1 : 0
        }),
        maxHeight: this.state.animVal.interpolate({
          inputRange: [0, 1],
          outputRange: ['100%', '0%']  // 0 : 150, 0.5 : 75, 1 : 0
        }),
      }}>
        <Swipeout
          style={styles.rootContainer}
          backgroundColor={'transparent'}
          right={this.swipeoutButtons}>
          <View style={{
            paddingTop: 5,
            paddingHorizontal: 5,
          }}>
            {title}
            {postInfo}
          </View>
          {postImage}
        </Swipeout>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  rootContainer: {
    marginTop: 10,
    marginBottom: 15,

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