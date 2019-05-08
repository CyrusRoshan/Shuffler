import React, { ReactNode } from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';

import Colors from '../constants/Colors';
import {Post, parsePost} from '../components/Post';
import {api, QueryParams} from '../lib/api';
import { storage } from '../lib/storage';
import { sleep } from '../lib/utils';

export interface Props {
  navigation: NavigationScreenProp<any>
};

interface State {
  loggedIn: boolean,
  name: string,

  populating: boolean,
  savedItems: ReactNode[],
  totalDone: number,
  totalItems: number,
  percentDone: number,
}

export default class SettingsScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      loggedIn: false,
      name: '',

      populating: false,
      savedItems: [],
      totalDone: 0,
      totalItems: 0,
      percentDone: 0,
    }

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

  async fetchAndPopulateSavedItems() {
    const props = {
      sort: 'new',
      t: 'all',
      type: 'links',
    } as QueryParams;

    console.log("getting saved items")

    console.log(await api.isAuthed());
    try {
      const user = await api.currentUser();
      console.log(user.json.name)
    } catch(e) {
      await api.forceRefresh();
    }

    this.setState({
      percentDone: 0,
      populating: true,
      totalDone: 0,
      totalItems: 0,
    })


    const updater = () => {
      this.setState({
        percentDone: this.state.percentDone + (1/1000) * 30,
      }, () => {
        console.log(this.state.percentDone, this.state.totalDone, this.state.totalItems, 'STATE');
      })
    }
    await sleep(1000);

    const savedItems = await api.user(this.state.name).allSaved(props)

    console.log("Total saved items:", savedItems.length)
    this.setState({
      percentDone: 30,
      totalItems: savedItems.length,
    });
    await sleep(1000);

    const savedImages = savedItems.filter((item) => {
      return item.data.post_hint === "image";
    })

    console.log("getting post data", savedImages)
    this.setState({
      percentDone: 40,
    });
    await sleep(1000);

    // Get saved image post data. We want to have the post data so we can save this to memory
    const savedImagePostData = savedImages.map((post) => {
      return parsePost(post);
    })

    // TODO: add loading bar
    // TODO: add option for downloading image data
    // TODO: save image data to AsyncStorage using IMAGE_PREFIX prefix + post ID as the key,
    // TODO: when fetching images for the first time
    // TODO:
    // TODO:

    this.setState({
      percentDone: 50,
    });
    await sleep(1000);
    const awaiters = Array(savedItems.length + 1) as Promise<any>[];

    const allPostIDs = savedImagePostData.map((postData) => {
      return postData.prefixed_id;
    })

    awaiters[0] = storage.postIDList().add(allPostIDs);
    savedImagePostData.forEach((postData, i) => {
      awaiters[i + 1] = storage.postData().save(postData.prefixed_id, postData);
    })

    var totalDone = 0;
    const incrementAndSetState = () => {
      totalDone += 1;
      this.setState({
        totalDone: totalDone,
        percentDone: 50 + 50 * (totalDone/this.state.totalItems),
      });
    }

    awaiters.forEach(async (awaiter) => {
      await awaiter;
      incrementAndSetState();
    });

    console.log("creating post elements", savedImagePostData)
    const savedImagePosts = savedImagePostData.map((postData) => {
      return <Post data={postData} />
    })

    this.setState({
      totalDone: totalDone,
      percentDone: 100,
    });
    await sleep(1000);

    console.log("rendering posts", savedImagePosts)
    this.setState({
      populating: false,
      savedItems: savedImagePosts,
    });
    await sleep(1000);

    return true;
  }

  render() {
    // Display authed/unauthed page
    var body;
    if (this.state.loggedIn) {
      body = (
        <View style={styles.postHolder}>
          <Text style={styles.regularText}>Logged in, {this.state.name}!</Text>
          <Text style={styles.linkText} onPress={async () => this.fetchAndPopulateSavedItems()}>Populate saved items!</Text>
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
          <Text style={styles.linkText} onPress={() => Linking.openURL(api.loginURL().url)}>
            Log in!
          </Text>
        </View>
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
        <Text style={styles.title}>Settings</Text>
        {populatingText}
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