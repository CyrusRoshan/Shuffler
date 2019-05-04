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
  loggedIn: boolean,
  name: string,
}

export default class SettingsScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      loggedIn: false,
      name: '',
    }

    // Update render if authed locally
    api.isAuthed().then(authed => {
      if (authed) {
        this.renderLogin();
      }
    })
  }

  renderLogin() {
    api.currentUser().then((u: any) => {
      this.setState({
        loggedIn: true,
        name: u.name,
      });
    })
  }

  render() {
    // Save params if we've been given them
    const params = this.props.navigation.state.params;
    if (params && params.access_token) {
      api.saveLogin(params.access_token);
      this.renderLogin();
    }

    // Display authed/unauthed page
    var body;
    if (this.state.loggedIn) {
      body = (
        <View style={styles.postHolder}>
          <Text>Logged in, {this.state.name}!</Text>
        </View>
      )
    } else {
      body = (
        <View style={styles.postHolder}>
          <Text onPress={() => Linking.openURL(api.loginURL().url)}>Log in!</Text>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <Text>{JSON.stringify(params)}</Text>
        {body}
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