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
    const postIDs = await storage.postIDList().get()
    if (!postIDs || !postIDs.length) {
      this.setState({isEmpty: true});
      return;
    }

    // Shuffle posts
    // shuffle(postIDs);

    // Get post data
    const postData = new Array(postIDs.length) as PostData[];
    for (var i = 0; i < postIDs.length; i++) {
      const data = await storage.postData().get(postIDs[i]);
      if (!data) {
        throw (`data is not valid for post with id ${postIDs[i]}`)
      }

      postData[i] = data;
    }

    // Create post cache
    const postCache = new PostCache({postData});

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
      body = <View style={styles.infoContainer}>
        <Text style={styles.infoMessage}>You have no cached posts. Go to the settings page!</Text>
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
		lineHeight: 30,
		fontWeight: '700',

		textAlign: 'center',
		alignSelf: 'stretch',
    color: Colors.lightYellow,
  },

  infoContainer: {
    flex: 1,
    padding: 30,
    paddingBottom: 70,
    flexDirection: 'column',
    justifyContent: 'center',
  },

	postHolder: {
    flex: 1,
    width: '100%',
  },
});