import React from 'react';
import { Component } from 'react';
import {
  StyleSheet,
  FlatList,
} from 'react-native';

import Colors from '../constants/Colors';
import { PostData } from '../lib/postdata';
import { PostCache } from './PostCache';
import { Post, PostSettings } from './Post';

export interface Props {
  cache: PostCache,
  postIDs: string[],
  postSettings: PostSettings,
}

export interface State {
  currentIndex: number
}

export default class PostScroller extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      currentIndex: 0,
    }
  }

  render() {
    return (
      <FlatList
        style={styles.root}
        horizontal={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}

        windowSize={8}
        maxToRenderPerBatch={5}
        initialNumToRender={2}

        data={this.props.postIDs}
        keyExtractor={(item, index) => item}
        renderItem={
          (data: any) => {
            return (
              <Post
                postID={this.props.postIDs[data.index]}
                cache={this.props.cache}
                settings={this.props.postSettings}
              />
            )
          }
        }
      />
    );
  };
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.darkBlack,
    width: '100%',
  }
});