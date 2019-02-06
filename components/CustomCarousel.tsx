import React from 'react';
import { Component } from 'react';
import {
  Image,
  Button,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeTouchEvent,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Platform,
  FlatList,
  StatusBar,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import Slide, { Props as SlideProps } from './Slide';
import Colors from '../constants/Colors';

export interface Props {
  // TODO: add slides as input here
}

export interface State {
  currentIndex: number
}

export default class CustomCarousel extends Component<Props, State> {
  render() {
    return (
      <FlatList
        style={styles.root}
        horizontal={false}
        // decelerationRate={0.998}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}

        data={ENTRIES}
        renderItem={(e) => {
          return (
            <Slide
              favorited={false} // TODO: add favorite system
              title={e.item.title}
              uri={e.item.uri}
              username={e.item.username}
              subreddit={e.item.subreddit}
              postAge={e.item.postAge}
            />
          )
        }}
        keyExtractor={(item, index) => index.toString()}
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

const ENTRIES = [
  {
    title: 'Here is an example title that seems to take up a bit of space',
    uri: 'https://i.redd.it/npco02i3kre21.jpg',
    username: 'example',
    subreddit: 'example',
    postAge: '1mo',
  },
  {
    title: 'example title 2',
    uri: 'https://i.redd.it/ggf74213hre21.jpg',
    username: 'example_username',
    subreddit: 'example_subreddit',
    postAge: '2d',
  },
  {
    title: 'example title 3',
    uri: 'https://i.redd.it/2ucsi86mare21.jpg',
    username: 'example_username',
    subreddit: 'example_subreddit',
    postAge: '5hr',
  },
  {
    title: 'example title 4',
    uri: 'https://i.imgur.com/h5s1ySA.jpg',
    username: 'example_username',
    subreddit: 'example_subreddit',
    postAge: '25m',
  },
  {
    title: 'example title 5',
    uri: 'https://i.imgur.com/h5s1ySA.jpg',
    username: 'example_username',
    subreddit: 'example_subreddit',
    postAge: '5s',
  },
  {
    title: 'example title 6',
    uri: 'https://i.imgur.com/h5s1ySA.jpg',
    username: 'example_username',
    subreddit: 'example_subreddit',
    postAge: '1hr',
  },
  {
    title: 'example title 7',
    uri: 'https://i.imgur.com/h5s1ySA.jpg',
    username: 'example_username',
    subreddit: 'example_subreddit',
    postAge: '5.2y',
  },
] as Array<SlideProps>