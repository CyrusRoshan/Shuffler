import React, { ReactNode } from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';

import Colors from '../constants/Colors';
import {Post, parsePost} from '../components/Post';
import {api, QueryParams} from '../lib/api';
import { storage } from '../lib/storage';
import { sleep, updater, getReadableTimeUntil } from '../lib/utils';
import { BooleanOption, ClickOption } from '../components/Option';
import { GetTokens, TokenHolder } from '../lib/tokenStorage';

export interface Props {
  navigation: NavigationScreenProp<any>
};

interface State {
  debug?: boolean,
  tokens?: TokenHolder,

  loggedIn?: boolean,
  name?: string,

  savedItemCount?: number,

  populating: boolean,
  totalToFetch: number,
  totalFetched: number,
  percentDone: number,
}

export default class SettingsScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      populating: false,
      totalFetched: 0,
      totalToFetch: 0,
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
        savedItemCount: 0,
      })
      return;
    }

    this.setState({
      savedItemCount: savedItems.length,
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
    var username = await storage.settings().username().get()
    if (!username) {
      const user  = await api.currentUser();

      username = user.json.name;
      if (!username) {
        throw(`error fetching user: ${user}`);
      }
      storage.settings().username().save(username);
    }

    const tokens = await GetTokens()
    this.setState({
      tokens,
      loggedIn: true,
      name: username,
    });
    return true;
  }

  async logOut() {
    await api.logout();
    this.setState({
      loggedIn: false,
      name: '',
    })
  }

  async clearAllData() {
    await storage.irreversablyClearAllData()
    this.setState({
      loggedIn: false,
      name: '',
      savedItemCount: 0,
    })
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
      totalFetched: 0,
      totalToFetch: 0,
    })

    const updateFunc = (currentPercent: number) => {
      this.setState({
        percentDone: currentPercent,
      });
    }

    // Updater to handle fetch progress
    const fetchPhasePct = 70;
    const fetchPhaseUpdater = updater(0, fetchPhasePct, 100, updateFunc);
    const savedItems = await api.user(this.state.name || '').allSaved(props, fetchPhaseUpdater)

    // Filter out non-image posts
    const savedImages = savedItems.filter((item) => {
      return item.data.post_hint === "image";
    })
    // Get saved image post data. We want to have the post data so we can save this to memory
    const savedImagePostData = savedImages.map((post) => {
      return parsePost(post);
    })

    // This is the number of images we're actually going to save.
    const totalToFetch = savedImagePostData.length;
    this.setState({
      totalToFetch: totalToFetch,
    })

    // Updater to handle save progress
    const savePhasePct = 100;
    const savePhaseUpdater = updater(fetchPhasePct, savePhasePct, totalToFetch, (c: number) => {
      this.setState({totalFetched: this.state.totalFetched + 1});
      updateFunc(c);
    })
    const awaiters = Array(totalToFetch + 1) as Promise<any>[];


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

    // Done populating.
    this.setState({
      populating: false,
    });
    this.getSavedItemCount();
    return true;
  }

  render() {
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

    // Only displayed if logged in
    var userInfo;
    var loggedInOptions;
    if (this.state.loggedIn) {

      // Only displayed if debug mode is on
      var debugInfo;
      var debugAuthOptions;
      if (this.state.debug) {
        debugAuthOptions = (<>
          <ClickOption optionText="Revalidate auth tokens?"
            action={() => this.revalidateAuth()} />
          <ClickOption optionText="Clear ALL data?"
            action={() => this.clearAllData()} />
        </>)

        if (!this.state.tokens) {
          debugInfo = <Text style={styles.regularText}>Error! No tokens found!</Text>
        } else {
          const expirationTime = this.state.tokens.RefreshDate.getTime();
          debugInfo = <Text style={styles.regularText}>Token expires in: {getReadableTimeUntil(expirationTime)}</Text>
        }
      }

      userInfo = (
        <>
          <Text style={styles.regularText}>-----------------</Text>
          <Text style={styles.regularText}>Logged in, {this.state.name}!</Text>
          <Text style={styles.regularText}>Saved post count: {this.state.savedItemCount}</Text>
          {debugInfo}
          <Text style={styles.regularText}>-----------------</Text>
        </>
      )
      loggedInOptions = (
        <>
          <View style={{marginTop: 20}}></View>
          <Text style={styles.subtitle}>Options</Text>
          <BooleanOption optionText="Lazy save posts for offline viewing?"
            getter={storage.settings().savePostImages().get}
            setter={storage.settings().savePostImages().save}/>
          <BooleanOption optionText="Should clicking posts navigate to reddit.com?"
            getter={storage.settings().clickableLinks().get}
            setter={storage.settings().clickableLinks().save}/>
          <ClickOption optionText="Fetch saved posts from Reddit?"
            action={() => this.fetchAndPopulateSavedItems()}/>
          <BooleanOption optionText="Show debug info?"
            getter={storage.settings().debugInfo().get}
            setter={storage.settings().debugInfo().save}
            onStateChange={debug => this.setState({debug})}/>

          <Text style={styles.subtitle}>Auth</Text>
          <ClickOption optionText="Log out?"
            action={() => this.logOut()}/>
          {debugAuthOptions}
        </>
      )
    }

    var populatingText;
    if (this.state.populating) {
      populatingText = <>
        <Text style={styles.regularText}>Saving {this.state.totalFetched} out of {this.state.totalToFetch}</Text>
        <Text style={styles.regularText}>{Math.round(this.state.percentDone)}% done</Text>
      </>
    }

    return (
      <View style={styles.container}>
        <View style={styles.postHolder}>
          <Text style={styles.title}>Settings</Text>
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

    marginBottom: 20,

    textAlign: 'center',
    alignSelf: 'stretch',
    color: Colors.lightWhite,
  },

  subtitle: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '900',

    marginTop: 10,
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