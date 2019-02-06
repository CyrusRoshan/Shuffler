import React from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View, Dimensions, Image } from 'react-native';

import { iOSUIKit, iOSColors } from 'react-native-typography';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';

import CustomCarousel from './CustomCarousel';

export interface Props {
	navigation: NavigationScreenProp<any>
};

interface State {
  loadQueue: Array<number>
  imgList: Array<string>
}

export default class AllSaved extends Component<Props, State> {
	render() {
		return (
			<View style={styles.container}>
        <Text style={[iOSUIKit.largeTitleEmphasized, styles.title]}>all saved posts</Text>

        <View style={styles.postHolder}>
          <CustomCarousel></CustomCarousel>
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

		backgroundColor: iOSColors.white,
    flex: 1,
    paddingBottom: 40,
	},

	title: {
		fontSize: 40,
		lineHeight: 50,
		fontWeight: '900',

		marginBottom: 0,

		textAlign: 'center',
		alignSelf: 'stretch',
		color: iOSColors.black,
	},

	postHolder: {
    flex: 1,
    width: '100%',

		paddingTop: 10,
  },
});