import React from 'react';
import { Component } from 'react';
import {
  StyleSheet,
  FlatList,
} from 'react-native';

import Slide, { Props as SlideProps } from '../components/Slide';
import Colors from '../constants/Colors';
import { Post, PostData } from './Post';
import { storage } from '../lib/storage';

export interface Props {
  postData: PostData[]
}

export interface State {
  currentIndex: number
}

export default class CustomCarousel extends Component<Props, State> {
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
        // decelerationRate={0.998}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
        data={this.props.postData}
        windowSize={5}
        maxToRenderPerBatch={1}
        initialNumToRender={2}
        renderItem={(e) => {
            return <Post data={e.item}/>
          }
        }
        keyExtractor={(item, index) => {
            return item.prefixed_id;
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