import React from 'react';
import { Component } from 'react';
import {
  StyleSheet,
  FlatList,
} from 'react-native';

import Colors from '../constants/Colors';
import { Post, PostData, PostSettings } from './Post';
import { PostCache } from './PostCache';

export interface Props {
  cache: PostCache,
  postData: PostData[],
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
        showsVerticalScrollIndicator={true}

        windowSize={5}
        maxToRenderPerBatch={5}
        initialNumToRender={2}

        data={this.props.postData}
        keyExtractor={(item, index) => item.prefixed_id}
        renderItem={
          (data: any) => {
            return (
              <Post
                index={data.index}
                cache={this.props.cache}
                data={data.item}

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