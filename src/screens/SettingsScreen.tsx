import React, { ReactNode } from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';

import Colors from '../constants/Colors';
import {Post, parsePost} from '../components/Post';
import {api, QueryParams} from '../lib/api';
import { storage } from '../lib/storage';
import { sleep, updater } from '../lib/utils';

// TODO: add loading bar
// TODO: add option for downloading image data
// TODO: save image data to AsyncStorage using IMAGE_PREFIX prefix + post ID as the key,
// TODO: when fetching images for the first time

export interface Props {
  navigation: NavigationScreenProp<any>
};

interface State {
  loggedIn: boolean,
  name: string,

  totalItems: number,

  populating: boolean,
  totalDone: number,
  percentDone: number,
}

export default class SettingsScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      loggedIn: false,
      name: '',

      totalItems: 0,

      populating: false,
      totalDone: 0,
      percentDone: 0,
    }

    this.getSavedItemCount();
    this.rerenderIfAuthed();
  }

  componentDidUpdate() {
    this.handleNavigationParams();
  }

  // Update render if authed locally
  async rerenderIfAuthed() {
    const authed = await api.isAuthed();
    if (authed) {
      this.getLogin();
    }
  }

  // Get count of saved items
  async getSavedItemCount() {
    const savedItems = await storage.postIDList().get();
    if (!savedItems) {
      this.setState({
        totalItems: 0,
      })
      return;
    }

    this.setState({
      totalItems: savedItems.length,
    })
  }

  // Save navigation state params if we've been given them
  async handleNavigationParams() {
    const params = this.props.navigation.state.params;

    if (params && params.code) {
      const code = params.code;
      this.props.navigation.setParams({ code: null });

      await api.login(code)
      this.getLogin();
    }
  }

  async getLogin() {
    var username = await storage.username().get()
    if (!username) {
      const user  = await api.currentUser();

      username = user.json.name;
      if (!username) {
        throw(`error fetching user: ${user}`);
      }
      storage.username().save(username);
    }

    this.setState({
      loggedIn: true,
      name: username,
    });
    return true;
  }

  async revalidateAuth() {
    try {
      await api.currentUser();
    } catch (e) {
      this.setState({
        loggedIn: false,
        name: '',
      });
    }
    return true;
  }

  async fetchAndPopulateSavedItems() {
    const props = {
      sort: 'new',
      t: 'all',
      type: 'links',
    } as QueryParams;

    this.setState({
      percentDone: 0,
      populating: true,
      totalDone: 0,
      totalItems: 0,
    })

    const updateFunc = (currentPercent: number) => {
      this.setState({
        percentDone: currentPercent,
      });
    }

    // Updater to handle fetch progress
    const fetchPhasePct = 70;
    const fetchPhaseUpdater = updater(0, fetchPhasePct, 100, updateFunc);
    const savedItems = await api.user(this.state.name).allSaved(props, fetchPhaseUpdater)

    // Filter out non-image posts
    const savedImages = savedItems.filter((item) => {
      return item.data.post_hint === "image";
    })
    // Get saved image post data. We want to have the post data so we can save this to memory
    const savedImagePostData = savedImages.map((post) => {
      return parsePost(post);
    })

    // This is the number of images we're actually going to save.
    const totalItems = savedImagePostData.length;
    this.setState({
      totalItems: totalItems,
    });

    // Updater to handle save progress
    const savePhasePct = 100;
    const savePhaseUpdater = updater(fetchPhasePct, savePhasePct, this.state.totalItems, (c: number) => {
      this.setState({totalDone: this.state.totalDone + 1});
      updateFunc(c);
    })
    const awaiters = Array(totalItems + 1) as Promise<any>[];


    // Save list of all post IDs
    const allPostIDs = savedImagePostData.map((postData) => {
      return postData.prefixed_id;
    })
    awaiters[0] = storage.postIDList().add(allPostIDs).then(savePhaseUpdater);

    // And save the KV map of post ID to post data
    savedImagePostData.forEach((postData, i) => {
      awaiters[i + 1] = storage.postData().save(postData.prefixed_id, postData).then(savePhaseUpdater);
    })

    // Wait for everything to finish. Updating % should happen asynchronously.
    for (let i = 0; i < awaiters.length; i++) {
      await awaiters[i];
    }

    // Done populating. Image posts can be rendered.
    this.setState({
      populating: false,
      totalItems: totalItems,
    });
    return true;
  }

  render() {
    // Display authed/unauthed page

    var loginButton;
    if (!this.state.loggedIn) {
      loginButton = (
        <>
          <Text style={styles.linkText} onPress={() => Linking.openURL(api.loginURL().url)}>
            Log in!
          </Text>
        </>
      )
    }

    var userInfo;
    var loggedInOptions;
    if (this.state.loggedIn) {
      userInfo = (
        <>
          <Text style={styles.regularText}>Logged in, {this.state.name}!</Text>
          <Text style={styles.linkText} onPress={() => this.revalidateAuth()}>Revalidate auth!</Text>
          {/* TODO: add logout button */}
        </>
      )
      loggedInOptions = (
        <>
          <Text style={styles.linkText} onPress={() => this.fetchAndPopulateSavedItems()}>(Re)populate saved posts!</Text>
          <Text style={styles.regularText}>Saved post count: {this.state.totalItems}</Text>
        </>
      )
    }

    var populatingText;
    if (this.state.populating) {
      populatingText = <>
        <Text style={styles.regularText}>Saving {this.state.totalDone} out of {this.state.totalItems}</Text>
        <Text style={styles.regularText}>{Math.round(this.state.percentDone)}% done</Text>
      </>
    }

    return (
      <View style={styles.container}>
        <View style={styles.postHolder}>
          {loginButton}
          {userInfo}
          {populatingText}
          {loggedInOptions}
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

  regularText: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500',

    marginBottom: 0,

    textAlign: 'center',
    alignSelf: 'stretch',
    color: Colors.lightWhite,
  },

  linkText: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500',

    marginBottom: 0,

    textAlign: 'center',
    alignSelf: 'stretch',
    color: Colors.lightBlue
  },

  postHolder: {
    flex: 1,
    width: '100%',

    paddingTop: 10,
  },
});