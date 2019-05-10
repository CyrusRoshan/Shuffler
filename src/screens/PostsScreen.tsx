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

export interface Props {
	navigation: NavigationScreenProp<any>
};

interface State {
  postData: PostData[]
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
    if (!postIDs) {
      throw (`postIDs are not valid`)
    }

    // Shuffle posts
    shuffle(postIDs);

    // Get post data
    const postData = new Array(postIDs.length) as PostData[];
    for (var i = 0; i < postIDs.length; i++) {
      const data = await storage.postData().get(postIDs[i]);
      if (!data) {
        throw (`data is not valid for post with id ${postIDs[i]}`)
      }

      postData[i] = data;
    }

    // Get settings and pass on
    const savePostImages = await storage.settings().savePostImages().get();
    const clickableLinks = await storage.settings().clickableLinks().get();

    // Save shuffled post data to state
    this.setState({
      postData,
      savePostImages,
      clickableLinks,
    })
  }

	render() {
		return (
			<View style={styles.container}>
        <Text style={styles.title}>all saved posts</Text>

        <View style={styles.postHolder}>
          <PostScroller
          postData={this.state.postData}
          clickableLinks={this.state.clickableLinks}
          savePostImages={this.state.savePostImages}></PostScroller>
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

	postHolder: {
    flex: 1,
    width: '100%',
  },
});