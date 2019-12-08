import React from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';

import PostScroller from '../components/PostScroller';
import Colors from '../constants/Colors';
import { PostSettings } from '../components/Post';
import { storage } from '../lib/storage';
import { shuffle, reorder } from '../lib/utils';
import { PostCache } from '../components/PostCache';

export interface Props {
  navigation: NavigationScreenProp<any>
  offline?: boolean
};

interface PostImageData {
  postImage: string,
  postImageHeight: number,
}

interface State {
  isEmpty?: boolean,
  postCache?: PostCache,
  postIDs: string[],
  postSettings: PostSettings,
}

export default class PostsScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      postIDs: [],
      postSettings: {
        clickableLinks: false,
        savePostImages: false,
        swipeOut: false,
        linkPrefix: '',
        hidePostDetails: false,
        hidePostTitle: false,
      }
    }
    this.getPostsData();
  }

  async getPostsData() {
    // Get all posts
    var postIDs;
    if (this.props.offline) {
      postIDs = await storage.offlinePostIDList.get()
    } else {
      postIDs = await storage.postIDList.get()
    }

    // Exit if no posts saved
    if (!postIDs || !postIDs.length) {
      this.setState({isEmpty: true});
      return;
    }

    // Shuffle posts
    reorder(postIDs);

    // Whether to filter out video posts or not
    var videoSupport = await storage.settings().experimentalVideoSupport().get()
    if (this.props.offline) {
      videoSupport = false; // No support for offline videos yet (see https://github.com/react-native-community/react-native-video/issues/266)
    }

    // Create post cache
    const saveForOffline = await storage.settings().savePostImages().get();
    const postCache = new PostCache({
      postIDs,
      offline: this.props.offline,
      saveForOffline,
      videoSupport,
    });

    // Get settings and pass on
    const postSettings = {
      savePostImages: await storage.settings().savePostImages().get(),
      clickableLinks: await storage.settings().clickableLinks().get(),
      swipeOut: await storage.settings().swipeOut().get(),
      linkPrefix: await storage.settings().linkPrefix().get() || "https://www.reddit.com",
      hidePostDetails: await storage.settings().hidePostDetails().get(),
      hidePostTitle: await storage.settings().hidePostTitle().get(),
    }

    // Save shuffled post data to state
    this.setState({
      postCache,
      postIDs,
      postSettings,
    })
  }

	render() {
    var body;
    if (this.state.postCache) {
      body = <PostScroller
        cache={this.state.postCache}
        postIDs={this.state.postIDs}
        postSettings={this.state.postSettings}
        />
    }

    if (this.state.isEmpty) {
      var emptyMessage = `you have no cached posts.\n
      go to the settings page to sync them from reddit!`;
      if (this.props.offline) {
        emptyMessage = `you have no offline posts.\n
        posts will be cached for offline use if you:\n
        1: enable the "lazy save" option in settings\n
        2: view posts in "all saved posts"`;
      }
      body = <View style={styles.infoContainer}>
        <Text style={styles.infoMessage}>{emptyMessage}</Text>
      </View>
    }

    var title;
    if (this.props.offline) {
      title = "offline posts";
    } else {
      title = "all saved posts";
    }

		return (
			<View style={styles.container}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.postHolder}>
          {body}
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

		marginBottom: 10,

		textAlign: 'center',
		alignSelf: 'stretch',
		color: Colors.lightWhite,
  },

	infoMessage: {
		fontSize: 30,
		lineHeight: 35,
		fontWeight: '500',

		textAlign: 'center',
		alignSelf: 'stretch',
    color: Colors.lightYellow,
  },

  infoContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 80,
    flexDirection: 'column',
    justifyContent: 'center',
  },

	postHolder: {
    flex: 1,
    width: '100%',
  },
});