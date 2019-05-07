import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import Colors from '../constants/Colors';

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
interface State {}

export class Post extends React.Component<Props, State> {
  render() {
    return (
      <View>
          <Text>{this.props.data.url}</Text>
          <Text>{this.props.data.author}</Text>
          <Text>{this.props.data.title}</Text>
          <Text>{this.props.data.subreddit}</Text>
          <Text>{this.props.data.id}</Text>
          <Text>{this.props.data.prefixed_id}</Text>
          <Text>{this.props.data.permalink}</Text>
      </View>
    )
  }
}