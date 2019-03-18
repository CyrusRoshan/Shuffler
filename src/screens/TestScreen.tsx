import React from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';

import Colors from '../constants/Colors';

import api from '../lib/api';

export interface Props {
  navigation: NavigationScreenProp<any>
};

interface State {
  loadQueue: Array<number>
  imgList: Array<string>
}

export default class TestScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    console.log('TEST SCREEN CONSTRUCTED')

    api.user('godblessthischild').comments({}).then(console.log)
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>test screen pls do not upvote</Text>

        <View style={styles.postHolder}>
          <Text>Testing:</Text>
          {/* <RedditFetcher></RedditFetcher> */}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...ifIphoneX({
      paddingTop: 50,
    }, {
      paddingTop: 20,
    }),

    backgroundColor: Colors.lightBlack,
    flex: 1,
  },

  title: {
    fontSize: 40,
    lineHeight: 50,
    fontWeight: '900',

    marginBottom: 0,

    textAlign: 'center',
    alignSelf: 'stretch',
    color: Colors.lightWhite,
  },

  postHolder: {
    flex: 1,
    width: '100%',

    paddingTop: 10,
  },
});