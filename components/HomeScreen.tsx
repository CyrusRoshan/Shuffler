import React from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProp } from 'react-navigation';

import Colors from '../constants/Colors';
import NavButton from './NavButton';

export interface Props {
  navigation: NavigationScreenProp<any>
};

export default class HomeScreen extends Component<Props> {
  render() {
    const shuffleIcon = <Feather name='layers' size={35} color={Colors.darkBlack} />
    const favoritesIcon = <Feather name='wifi-off' size={35} color={Colors.darkBlack} />
    const settingsIcon = <Feather name='settings' size={35} color={Colors.darkBlack} />

    return (
      <View style={styles.container}>
        <View style={styles.navButtonHolder}>

          <Text style={styles.title}>shuffler</Text>

          <NavButton
            title='all saved posts'
            icon={shuffleIcon}
            styleOptions={{
              iconBackgroundColor: Colors.lightGreen,
              backgroundColor: 'transparent',
              titleColor: Colors.lightGreen,
            }}
            onPress={() => this.props.navigation.push('AllSaved')}
          ></NavButton>

          <NavButton
            title='offline favorites'
            icon={favoritesIcon}
            styleOptions={{
              iconBackgroundColor: Colors.lightYellow,
              backgroundColor: 'transparent',
              titleColor: Colors.lightYellow,
            }}
            onPress={() => this.props.navigation.push('Favorites')}
          ></NavButton>

          <NavButton
            title='settings'
            icon={settingsIcon}
            styleOptions={{
              iconBackgroundColor: Colors.darkWhite,
              backgroundColor: 'transparent',
              titleColor: Colors.darkWhite,
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
    backgroundColor: Colors.lightBlack,
    flex: 1,
  },

  title: {
    fontSize: 50,
    lineHeight: 50,
    fontWeight: '900',

    marginBottom: 20,

    textAlign: 'center',
    alignSelf: 'stretch',
    color: Colors.lightWhite,
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