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

import { iOSUIKit, iOSColors } from 'react-native-typography';
import Feather from 'react-native-vector-icons/Feather';

import Slide, { Props as SlideProps } from './Slide';

export interface Props {

}

export interface State {
  currentIndex: number
}

const SLIDEWIDTH = 200

export default class CustomCarousel extends Component<Props, State> {
  render() {
    let entries = ENTRIES.map((e, i) => {
      return <Slide
        title={e.title}
        subtitle={e.subtitle}
        uri={e.uri}
        key={i}
      />
    })

    return (
      <FlatList
        style={styles.root}
        pagingEnabled={true}
        horizontal={true}
        snapToAlignment='center'
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}

        data={ENTRIES}
        renderItem={(e) => {
          return (
            <Slide
              title={e.item.title}
              subtitle={e.item.subtitle}
              uri={e.item.uri}
            />
          )
        }}
        keyExtractor={(item, index) => index.toString()}
      />
      // <ScrollView
      //   style={styles.root}
      //   pagingEnabled={true}
      //   horizontal={true}
      //   snapToAlignment='center'
      // >
      //   {entries}
      // </ScrollView>
    );
  };
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    backgroundColor: 'black',
  }
});

const ENTRIES = [
  {
    title: 'short 1',
    subtitle: 'suuuuubtitle',
    uri: 'https://i.redd.it/npco02i3kre21.jpg',
  },
  {
    title: 'example title 2',
    subtitle: 'suuuuubtitle',
    uri: 'https://i.redd.it/ggf74213hre21.jpg',
  },
  {
    title: 'example title 3',
    subtitle: 'suuuuubtitle',
    uri: 'https://i.redd.it/2ucsi86mare21.jpg',
  },
  {
    title: 'example title 4',
    subtitle: 'suuuuubtitle',
    uri: 'https://i.imgur.com/h5s1ySA.jpg'
  },
  {
    title: 'example title 5',
    subtitle: 'suuuuubtitle',
    uri: 'https://i.imgur.com/h5s1ySA.jpg'
  },
  {
    title: 'example title 6',
    subtitle: 'suuuuubtitle',
    uri: 'https://i.imgur.com/h5s1ySA.jpg'
  },
  {
    title: 'example title 7',
    subtitle: 'suuuuubtitle',
    uri: 'https://i.imgur.com/h5s1ySA.jpg'
  },
] as Array<SlideProps>