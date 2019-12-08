import React from 'react';
import { Component } from 'react';
import {
  StyleSheet,
  FlatList,
  Button,
  View,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import Colors from '../constants/Colors';
import { PostCache } from './PostCache';
import { Post, PostSettings } from './Post';
import { TouchableOpacity } from 'react-native-gesture-handler';

export interface Props {
  cache: PostCache,
  postIDs: string[],
  postSettings: PostSettings,
}

export interface State {
  autoscroll: boolean,
  currentIndex: number
}

export default class PostScroller extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      autoscroll: false,
      currentIndex: 0,
    }
  }

  flatlistRef: FlatList<any>|null = null;
  scrollInterval?: number;
  scrollFunc = () => {
    if (!this.flatlistRef) {
      return;
    }
    var newIndex = this.state.currentIndex + 1;
    this.flatlistRef.scrollToIndex({ animated: true, index: newIndex, viewPosition: 0.3, });
    this.setState({ currentIndex: newIndex });
  }

  render() {
    return (
      <>
        <View
          style={[styles.autoplay, this.state.autoscroll ? styles.stopAutoplay : styles.startAutoplay]}
        >
          <TouchableOpacity
            onPress={() => {
              if (this.state.autoscroll) {
                clearInterval(this.scrollInterval)
              } else {
                this.scrollFunc();
                this.scrollInterval = setInterval(this.scrollFunc, 5000)
              }
              this.setState({ autoscroll: !this.state.autoscroll })
            }
          }>
            {this.state.autoscroll ? stopIcon : startIcon}
          </TouchableOpacity>
        </View>
        <FlatList
          style={styles.root}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}

          windowSize={8}
          maxToRenderPerBatch={5}
          initialNumToRender={2}

          ref={(ref) => { this.flatlistRef = ref; }}

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
      </>
    );
  };
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: Colors.darkBlack,
    width: '100%',
  },

  autoplay: {
    position: 'absolute',
    zIndex: 1000,

    bottom: 40,
    right: 10,

    paddingTop: 9,
    padding: 8.5,
    paddingBottom: 5.5,
    borderRadius: 100,

    borderColor: Colors.white,
    borderWidth: 2,
  },
  startAutoplay: {
    backgroundColor: Colors.lightGreen,
  },
  stopAutoplay: {
    backgroundColor: Colors.lightRed,
  },
});

const startIcon = <Feather name='play-circle' size={40} color={Colors.white} />
const stopIcon = <Feather name='pause-circle' size={40} color={Colors.white} />