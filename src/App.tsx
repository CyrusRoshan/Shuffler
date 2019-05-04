import React from 'react';
import { createStackNavigator, createAppContainer, NavigationActions } from 'react-navigation';

import HomeScreen from './screens/HomeScreen'
import AllSavedScreen from './screens/AllSavedScreen'
import SettingsScreen from './screens/SettingsScreen'
import api from './lib/api';

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
      path: 'settings',
      navigationOptions: {
        header: null,
      },
    },
  },

  {
    initialRouteName: 'Home',
  }
);

const previousAction = NavigationStack.router.getActionForPathAndParams
NavigationStack.router.getActionForPathAndParams = function (path, params: any) {
  console.log(path, params);
  if (
    path.indexOf('settings') === 0
  ) {
    params = {};

    try {
      const pathParts = path.split('#')[1]
      const queries = pathParts.split('&');

      for (var i = 0; i < queries.length; i++) {
        const parts = queries[i].split('=');
        const param = decodeURIComponent(parts[0]);
        const val = decodeURIComponent(parts[1]);
        params[param] = val;
      }
    } catch (e) {
      console.error(e);
    }

    return previousAction('settings', params);

  }
  return previousAction(path, params);
}

const AppContainer = createAppContainer(NavigationStack);
export default () => <AppContainer uriPrefix={'shuffler://'} />;