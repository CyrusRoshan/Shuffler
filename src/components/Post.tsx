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
import { getReadableDateSince } from '../lib/utils';
import { PostCache } from './PostCache';

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
  rawImg: string,
  imageHeight?: number,
}

export class Post extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      rawImg: '',
    }
  }

  _isMounted = false;

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

  componentDidMount() {
    this._isMounted = true;
    this.getImageData();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (!this.state.rawImg) {
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
              numberOfLines={4}
              onPress={clickFunc(this.props.data.permalink)}>{this.props.data.title}</Text>
            <View style={styles.container}>
              <Text
                style={[styles.containerElement, styles.regularText, styles.descLinks, {color: Colors.darkGreen}]}
                onPress={clickFunc("/u/" + this.props.data.author)}>u/{this.props.data.author}</Text>

              <Text
                style={[styles.containerElement, styles.regularText, styles.descLinks, {color: Colors.darkYellow}]}
                onPress={clickFunc("/r/" + this.props.data.subreddit)}>r/{this.props.data.subreddit}</Text>

              <View style={[styles.containerElement, {flexDirection: 'row', justifyContent: 'center'}, styles.descLinks]}>
                <Feather style={[styles.regularText, { color: Colors.darkWhite }]} name='clock' size={30}/>
                <Text style={[styles.regularText, { color: Colors.darkWhite }]}> {readableTimeDiff} ago</Text>
              </View>
            </View>
          </View>
          <View style={{width: '100%', backgroundColor: Colors.lightBlack}}>
            <Image style={
              {
                flex: 1,
                width: '100%',
                height: this.state.imageHeight || 200,
                resizeMode: 'cover',
              }
            } source={{ uri: this.state.rawImg }} />
          </View>
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