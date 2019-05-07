import React, { ReactNode } from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';

import Colors from '../constants/Colors';
import {Post, parsePost} from '../components/Post';
import {api, QueryParams} from '../lib/api';

const SETTINGS_PREFIX = 'SETTINGS'
const USER_NAME_KEY = SETTINGS_PREFIX + '-' + 'USERNAME';

export interface Props {
  navigation: NavigationScreenProp<any>
};

interface State {
  loggedIn: boolean,
  name: string,
  savedItems: ReactNode[],
}

export default class SettingsScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      loggedIn: false,
      name: '',
      savedItems: [],
    }

    // Update render if authed locally
    api.isAuthed().then(authed => {
      if (authed) {
        AsyncStorage.getItem(USER_NAME_KEY).then(user => {
          if (user) {
            this.setState({
              loggedIn: true,
              name: user,
            });
          }
          this.getLogin();
        })
      }
    })
  }

  async getLogin() {
    const user  = await api.currentUser();
    const name = user.json.name;
    if (!name) {
      throw(`error fetching user: ${user}`);
    }

    AsyncStorage.setItem(USER_NAME_KEY, name);
    this.setState({
      loggedIn: true,
      name: name,
    });
    return true;
  }

  async fetchAndPopulateSavedItems() {
    // {
    //   context ?: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    //     show ?: 'given',
    //     sort ?: 'hot' | 'new' | 'top' | 'controversial',
    //     t ?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all',
    //     type ?: 'links' | 'comments',
    //     username ?: string,
    //     after ?: string,
    //     before ?: string,
    //     count ?: number,
    //     include_categories ?: boolean,
    //     limit ?: number,
    //     sr_detail ?: boolean,
    // }
    const props = {
      sort: 'new',
      t: 'all',
      type: 'links',
    } as QueryParams;

    console.log("getting saved items")
    const savedItems = await api.user(this.state.name).allSaved(props)
    console.log("filtering saved items", savedItems)
    const savedImages = savedItems.filter((item) => {
      return item.data.post_hint === "image";
    })

    console.log("getting post data", savedImages)
    // Get saved image post data. We want to have the post data so we can save this to memory
    const savedImagePostData = savedImages.map((post) => {
      return parsePost(post);
    })
    // TODO: get existing [] of post IDs from AsyncStorage
    // TODO: deduplicate existing [] using set notation: [...new Set([...arr1, ...arr2])];
    // TODO: add all posts to AsyncStorage using POST_PREFIX prefix + post ID as the key

    // TODO: add loading bar
    // TODO: add option for downloading image data
    // TODO: save image data to AsyncStorage using IMAGE_PREFIX prefix + post ID as the key,
    // TODO: when fetching images for the first time
    // TODO:
    // TODO:

    console.log("creating post elements", savedImagePostData)
    const savedImagePosts = savedImagePostData.map((postData) => {
      return <Post data={postData} />
    })

    console.log("rendering posts", savedImagePosts)
    this.setState({
      savedItems: savedImagePosts,
    })

    return true;
  }

  render() {
    // Save params if we've been given them
    const params = this.props.navigation.state.params;
    if (params && params.code) {
      api.login(params.code).then(this.getLogin)
    }

    // Display authed/unauthed page
    var body;
    if (this.state.loggedIn) {
      body = (
        <View style={styles.postHolder}>
          <Text>Logged in, {this.state.name}!</Text>
          <Text onPress={() => this.fetchAndPopulateSavedItems()}>Populate saved items!</Text>
          <View>
            {this.state.savedItems.map(function (post, i) {
              return (
                <View key={i}>
                  {post}
                </View>
              )
            })}
          </View>
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