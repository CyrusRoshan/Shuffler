import React from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';

import PostScroller from '../components/PostScroller';
import Colors from '../constants/Colors';
import { PostData } from '../components/Post';
import { storage } from '../lib/storage';
import { shuffle } from '../lib/utils';
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
  postData: PostData[],
  clickableLinks: boolean,
  savePostImages: boolean,
}

export default class PostsScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      postData: [],
      clickableLinks: false,
      savePostImages: false,
    }
    this.getPostsData();
  }

  async getPostsData() {
    // Get all posts
    var postIDs;
    if (this.props.offline) {
      postIDs = await storage.offlinePostIDList().get()
    } else {
      postIDs = await storage.postIDList().get()
    }

    // Exit if no posts saved
    if (!postIDs || !postIDs.length) {
      this.setState({isEmpty: true});
      return;
    }

    // Shuffle posts
    // shuffle(postIDs);

    // Whether to filter out video posts or not
    var videoSupport = await storage.settings().experimentalVideoSupport().get()
    if (this.props.offline) {
      videoSupport = false; // No support for offline videos yet (see https://github.com/react-native-community/react-native-video/issues/266)
    }

    // Get post data
    var postData: PostData[] = [];
    for (var i = 0; i < postIDs.length; i++) {
      const data = await storage.postData().get(postIDs[i]);
      if (!data) {
        continue;
      }
      if (data.type === 'video' && !videoSupport) {
        continue;
      }
      postData.push(data);
    }

    // Create post cache
    const postCache = new PostCache({postData, offline: this.props.offline});

    // Get settings and pass on
    const savePostImages = await storage.settings().savePostImages().get();
    const clickableLinks = await storage.settings().clickableLinks().get();

    // Save shuffled post data to state
    this.setState({
      postCache,
      postData,
      savePostImages,
      clickableLinks,
    })
  }

	render() {
    var body;
    if (this.state.postCache) {
      body = <PostScroller
        cache={this.state.postCache}
        postData={this.state.postData}
        clickableLinks={this.state.clickableLinks}
        savePostImages={this.state.savePostImages}></PostScroller>
    }

    if (this.state.isEmpty) {
      var emptyMessage = "you have no cached posts.\n\ngo to the settings page!";
      if (this.props.offline) {
        emptyMessage = `you have no offline posts.\n\nposts will be cached for offline use as you view them normally in "all saved posts"`;
      }
      body = <View style={styles.infoContainer}>
        <Text style={styles.infoMessage}>{emptyMessage}</Text>
      </View>
    }

		return (
			<View style={styles.container}>
        <Text style={styles.title}>all saved posts</Text>

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