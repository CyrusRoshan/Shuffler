import React from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';

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

export default class SettingsScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    const params = this.props.navigation.state.params;
    const paramsString = JSON.stringify(params);
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.postHolder}>
          <Text onPress={() => Linking.openURL("shuffler://settings")}>Log in!</Text>
          <Text>Params:!</Text>
          <Text>{paramsString}</Text>
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