import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from './screens/HomeScreen'
import AllSavedScreen from './screens/AllSavedScreen'
import SettingsScreen from './screens/SettingsScreen'

const NavigationStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        header: null,
      },
    },

    AllSaved: {
      screen: AllSavedScreen,
      navigationOptions: {
        header: null,
      },
    },

    Favorites: {
      screen: HomeScreen, // todo: change
      navigationOptions: {
        header: null,
      },
    },

    Settings: {
      screen: SettingsScreen,
      navigationOptions: {
        header: null,
      },
    },
  },

  {
    initialRouteName: 'Home',
  }
);

const AppContainer = createAppContainer(NavigationStack);
export default () => <AppContainer uriPrefix={'shuffler://'} />;