import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from './screens/HomeScreen'
import AllSavedScreen from './screens/AllSavedScreen'
import RedirectScreen from './screens/RedirectScreen'
import TestScreen from './screens/TestScreen'

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
      screen: HomeScreen, // todo: change
      navigationOptions: {
        header: null,
      },
    },

    // TODO: REMOVE THIS SCREEN
    Test: {
      screen: TestScreen,
      navigationOptions: {
        header: null,
      },
    },

    Redirect: {
      screen: RedirectScreen,
      navigationOptions: {
        header: null,
      },
      path: 'redirect',
    },
  },

  {
    initialRouteName: 'Test', // todo: change back to home
  }
);

const AppContainer = createAppContainer(NavigationStack);
export default () => <AppContainer uriPrefix={'shuffler://'} />;