import React from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Linking,
  Button,
  TouchableOpacity,
} from 'react-native';

import { SwipeRow } from 'react-native-swipe-list-view';
import Feather from 'react-native-vector-icons/Feather';
const VideoPlayer = require('react-native-video-player').default;

import Colors from '../constants/Colors';
import { getReadableTimeSince } from '../lib/utils';
import { PostCache } from './PostCache';
import { PostData } from '../lib/postdata';

const BUTTON_WIDTH = 80;

interface Props {
  postID: string,
  cache: PostCache,

  settings: PostSettings,
}

export interface PostSettings {
  linkPrefix: string,
  clickableLinks: boolean
  swipeOut: boolean
  savePostImages: boolean

  hidePostDetails: boolean
  hidePostTitle: boolean
}

interface State {
  rawImg?: string,
  imageHeight?: number,

  postData?: PostData,

  animVal: Animated.Value,
}

export class Post extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      animVal: new Animated.Value(0),
    }
  }

  async componentDidMount() {
    var postData = await this.props.cache.getPostData(this.props.postID);
    if (postData) {
      this.setState({postData})
      if (postData.type === 'image') {
        await this.getImageData();
      }
    }
  }

  // Get base64 imagedata and image size for render
  async getImageData() {
    const imageData = await this.props.cache.getImageData(this.props.postID);
    if (!imageData) {
      return;
    }

    // Size image
    const screenWidth = Dimensions.get('window').width;
    const scaleFactor = imageData.width / screenWidth;
    const imageHeight = imageData.height / scaleFactor;

    this.setState({
      rawImg: imageData.data,
      imageHeight,
    })
  }

  clickFunc = (path: string) => () => {
    if (this.props.settings.clickableLinks) {
      Linking.openURL(this.props.settings.linkPrefix + path);
    }
  }

  removePost() {
    if (!this.state.postData) {
      return;
    }
    Animated.timing(this.state.animVal, {
      toValue: 1,
      duration: 500,
    }).start(async () => {
      if (!this.state.postData) {
        console.error("Postdata should be defined...");
        return;
      }

      // Delete from disk
      this.props.cache.deletePost(this.props.postID, this.state.postData.prefixed_id);
      this.setState({ postData: undefined });
    });
  }


  render() {
    if (!this.state.postData || this.state.postData.type === 'image' && !this.state.rawImg) {
      return <View style={styles.imagePlaceholder}></View>;
    }

    const title = (
      <Text style={styles.postTitle}
        adjustsFontSizeToFit={true}
        numberOfLines={4}
        onPress={this.clickFunc(this.state.postData.permalink)}>{this.state.postData.title}</Text>
    );

    const readableTimeDiff = getReadableTimeSince(this.state.postData.created_utc * 1000); // This date is in s not ms
    const postInfo = (
      <View style={styles.container}>
        <Text
          style={[styles.containerElement, styles.regularText, { color: Colors.darkGreen }]}
          onPress={this.clickFunc("/u/" + this.state.postData.author)}>u/{this.state.postData.author}</Text>

        <Text
          style={[styles.containerElement, styles.regularText, { color: Colors.darkYellow }]}
          onPress={this.clickFunc("/r/" + this.state.postData.subreddit)}>r/{this.state.postData.subreddit}</Text>

        <View style={[styles.containerElement, { flexDirection: 'row', justifyContent: 'center' }]}>
          <Feather style={[styles.regularText, { color: Colors.darkWhite }]} name='clock' size={30} />
          <Text style={[styles.regularText, { color: Colors.darkWhite }]}> {readableTimeDiff} ago</Text>
        </View>
      </View>
    );

    var postContent;
    if (this.state.postData.type === 'image') {
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
    } else if (this.state.postData.type === 'video') {
      postContent = (
        <View style={{ width: '100%', backgroundColor: Colors.lightBlack }}>
          <VideoPlayer
            video={{ uri: this.state.postData.dataURL }}
            style={{
              flex: 1,
              width: '100%',
              aspectRatio: 1,
            }}
            videoWidth={720}
            resizeMode={'contain'}

            autoplay={true}
            defaultMuted={true}
            loop={true}

            hideControlsOnStart={true}
          />
        </View>
      );
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
          {!this.props.settings.hidePostTitle && title}
          {!this.props.settings.hidePostDetails && postInfo}
          <SwipeRow
            recalculateHiddenLayout={true}

            disableRightSwipe={true}
            rightOpenValue={-BUTTON_WIDTH}

            friction={70}
            tension={30}
            swipeToOpenPercent={75}
            swipeToClosePercent={25}
          >
            <View style={styles.backRow}>
              <TouchableOpacity
                style={[styles.swipeoutButton, styles.deleteButton]}
                onPress={() => this.removePost()}
              >
                <Text style={styles.buttonText}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              {postContent}
            </View>
          </SwipeRow>
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

  backRow: {
    backgroundColor: 'red',
    flex: 1,
  },

  swipeoutButton: {
    bottom: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: BUTTON_WIDTH
  },

  buttonText: {
    color: Colors.white,
    fontSize: 18,
  },

  deleteButton: {
    backgroundColor: 'red',
    right: 0,
  },
});