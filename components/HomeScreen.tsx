import React from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { iOSUIKit, iOSColors } from 'react-native-typography';
import AntIcon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';

import NavButton from './NavButton';

export interface Props {
  navigation: NavigationScreenProp<any>
};

export default class HomeScreen extends Component<Props> {
  render() {
    const shuffleIcon = <AntIcon name='retweet' size={35} color={iOSColors.white} />
    const favoritesIcon = <Feather name='star' size={35} color={iOSColors.white} />
    const settingsIcon = <Feather name='settings' size={35} color={iOSColors.white} />

    return (
      <View style={styles.container}>
        <View style={styles.navButtonHolder}>

          <Text style={[iOSUIKit.largeTitleEmphasized, styles.title]}>shuffler</Text>

          <NavButton
            title='all saved posts'
            icon={shuffleIcon}
            style={{
              iconBackgroundColor: iOSColors.green,
              backgroundColor: 'transparent',
              titleColor: iOSColors.green,
            }}
            onPress={() => this.props.navigation.push('AllSaved')}
          ></NavButton>

          <NavButton
            title='offline favorites'
            icon={favoritesIcon}
            style={{
              iconBackgroundColor: iOSColors.yellow,
              backgroundColor: 'transparent',
              titleColor: iOSColors.orange,
            }}
            onPress={() => this.props.navigation.push('Favorites')}
          ></NavButton>

          <NavButton
            title='settings'
            icon={settingsIcon}
            style={{
              iconBackgroundColor: iOSColors.gray,
              backgroundColor: 'transparent',
              titleColor: iOSColors.gray,
            }}
            onPress={() => this.props.navigation.push('Settings')}
          ></NavButton>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...ifIphoneX({
      paddingBottom: 50,
    }, {
      paddingBottom: 20,
    }),
    backgroundColor: iOSColors.white,
    flex: 1,
  },

  title: {
    fontSize: 50,
    lineHeight: 50,
    fontWeight: '900',

    marginBottom: 20,

    textAlign: 'center',
    alignSelf: 'stretch',
    color: iOSColors.black,
  },

  navButtonHolder: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',

    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 10,
  },
});