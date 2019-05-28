import React, { ReactNode } from 'react';
import { Component } from 'react';
import { Alert, StyleSheet, Text, View, Linking } from 'react-native';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';

import Colors from '../constants/Colors';
import { ParsePost, PostData} from '../components/Post';
import {api, ListingParams, LoginURL} from '../lib/api';
import { storage } from '../lib/storage';
import { updater, getReadableTimeUntil } from '../lib/utils';
import { BooleanOption, ClickOption, TextOption } from '../components/Option';
import { GetTokens, TokenHolder, DeleteTokens, RefreshTokens } from '../lib/tokenStorage';
import { ScrollView } from 'react-native-gesture-handler';

export interface Props {
  navigation: NavigationScreenProp<any>
};

interface State {
  debug?: boolean,
  tokens?: TokenHolder,

  loggedIn?: boolean,
  name?: string,

  savedItemCount?: number,
  invalidItems?: number,

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
    const authed = await api.auth().isAuthed();
    if (authed) {
      this.getLogin();
    }
  }

  // Get count of saved items
  async getSavedItemCount() {
    const savedItems = await storage.postIDList.get();
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

      await api.auth().login(code)
      await this.fetchAndPopulateSavedItems();
      await this.getLogin();
    }
  }

  async getLogin() {
    const username = await storage.settings().username().get()
    if (username) {
      const tokens = await GetTokens(api.auth().refresh)
      this.setState({
        tokens,
        loggedIn: true,
        name: username,
      });
    } else {
      await this.revalidateAuth();
    }
  }

  async logOut() {
    await api.auth().logout();
    this.setState({
      loggedIn: false,
      name: '',
    })
  }

  async clearAllData() {
    await storage.irreversablyClearAllData()
    await DeleteTokens();
    this.setState({
      loggedIn: false,
      name: '',
      savedItemCount: 0,
    })
  }

  async clearPostData() {
    const postIDs = await storage.postIDList.get()
    if (postIDs) {
      postIDs.forEach(async (postID) => {
        await storage.postData().delete(postID);
        await storage.imageData().delete(postID);
      });
    }
    await storage.offlinePostIDList.deleteALL();
    await storage.postIDList.deleteALL();
    this.setState({
      savedItemCount: 0,
    })
  }

  async revalidateAuth() {
    const tokens = await api.auth().forceRefresh();
    this.setState({tokens});

    try {
      const user = await api.call().currentUser();

      const username = user.json.name;
      if (!username) {
        throw (`error fetching user: ${user}`);
      }

      await storage.settings().username().save(username);
      this.setState({
        name: username,
        loggedIn: true
      })
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
    } as ListingParams;

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

    if (!this.state.name) {
      return;
    }

    // Updater to handle fetch progress
    const fetchPhasePct = 70;
    const fetchPhaseUpdater = updater(0, fetchPhasePct, 100, updateFunc);
    const savedItems = await api.call().user(this.state.name).allSaved(props, fetchPhaseUpdater)

    // Get saved image post data. We want to have the post data so we can save this to memory
    const savedPostData = savedItems.map((itemResult) => {
      return ParsePost(itemResult.data);
    }).filter((postdata) => postdata !== undefined) as PostData[];

    // Exit if no images
    if (!savedPostData.length) {
      this.setState({
        populating: false,
      });
      return
    }

    // Log number of invalid items (items we couldn't conver to posts)
    this.setState({
      invalidItems: savedItems.length - savedPostData.length
    })

    // This is the number of images we're actually going to save.
    const totalToFetch = savedPostData.length;
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
    const allPostIDs = savedPostData.map((postData) => {
      return postData.prefixed_id;
    })
    awaiters[0] = storage.postIDList.add(allPostIDs).then(savePhaseUpdater);

    // And save the KV map of post ID to post data
    savedPostData.forEach((postData, i) => {
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
          <Text style={styles.linkText} onPress={() => Linking.openURL(LoginURL().url)}>
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
      var debugOptions;
      if (this.state.debug) {
        debugOptions = (<>
          <TextOption optionText="Reddit link prefix? Can be used to open other apps on iOS."
            placeholder="https://www.reddit.com"
            getter={storage.settings().linkPrefix().get}
            setter={storage.settings().linkPrefix().save} />
        </>)

        debugAuthOptions = (<>
          <ClickOption optionText="Clear cached posts?"
            action={() => alertUser(
              'Are you sure?',
              'This will clear offline posts!',
              this.clearPostData.bind(this)
            )}
            dangerLevel={1}
          />
          <ClickOption optionText="Clear all data?"
            action={() => alertUser(
              'Are you sure?',
              'This will clear posts, settings, everything!',
              this.clearAllData.bind(this))
            }
            dangerLevel={2}
          />
          <ClickOption optionText="Manually refresh tokens?"
            action={() => this.revalidateAuth()}
            dangerLevel={0}
          />
        </>)

        var debugTokenInfo;
        if (!this.state.tokens) {
          debugTokenInfo = <Text style={styles.regularText}>Error! No tokens found!</Text>
        } else {
          const expirationTime = this.state.tokens.RefreshDate.getTime();
          debugTokenInfo = <Text style={styles.regularText}>Token expires in: {getReadableTimeUntil(expirationTime)}</Text>
        }

        if (this.state.invalidItems) {
          debugInfo = <>
            <Text style={styles.regularText}>Invalid items: {this.state.invalidItems}</Text>
            {debugTokenInfo}
          </>
        } else {
          debugInfo = debugTokenInfo;
        }
      }

      userInfo = (
        <>
          <Text style={styles.regularText}>Logged in, <Text style={{color: Colors.darkYellow}}>{this.state.name}</Text>!</Text>
          <Text style={styles.regularText}>Cached post count: {this.state.savedItemCount}</Text>
          {debugInfo}
        </>
      )
      loggedInOptions = (
        <>
          <View style={{marginTop: 20}}></View>
          <Text style={styles.subtitle}>Actions</Text>
          <ClickOption optionText="Re-cache saved posts from Reddit?"
            action={() => this.fetchAndPopulateSavedItems()} />

          <Text style={styles.subtitle}>Options</Text>
          <BooleanOption optionText="Lazy save posts for offline viewing?"
            getter={storage.settings().savePostImages().get}
            setter={storage.settings().savePostImages().save}/>
          <BooleanOption optionText="Should clicking posts navigate to reddit?"
            getter={storage.settings().clickableLinks().get}
            setter={storage.settings().clickableLinks().save}/>
          <BooleanOption optionText="Show debug info?"
            getter={storage.settings().debugInfo().get}
            setter={storage.settings().debugInfo().save}
            onStateChange={debug => this.setState({debug})}/>
          <BooleanOption optionText="Enable experimental video support?"
            getter={storage.settings().experimentalVideoSupport().get}
            setter={storage.settings().experimentalVideoSupport().save}/>
          <BooleanOption optionText="Enable swipe to delete?"
            getter={storage.settings().swipeOut().get}
            setter={storage.settings().swipeOut().save}/>
          {debugOptions}

          <Text style={styles.subtitle}>Auth</Text>
          <ClickOption optionText="Log out?"
            action={() => alertUser(
              'Are you sure?',
              `Just FYI, logging you out won't delete your cached on-device post or image data.`,
              this.logOut.bind(this))
            }
            dangerLevel={1}
          />
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
          <Text style={styles.title}>Settings</Text>
          <ScrollView
          style={styles.innerContainer}
          alwaysBounceVertical={false}>
            {loginButton}
            {userInfo}
            {populatingText}
            {loggedInOptions}
            <View style={{height: 50}}></View>
          </ScrollView>
      </View>
    );
  }
}

function alertUser(title: string, message: string, onConfirm: () => void) {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: "Yes, I'm Sure", onPress: onConfirm },
    ],
    { cancelable: true },
  );
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

    marginTop: 5,
    marginBottom: 3,

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

  innerContainer: {
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 50,
  },
});