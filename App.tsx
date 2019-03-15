import { createStackNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from '@local/components/HomeScreen'
import AllSavedScreen from '@local/components/AllSavedScreen'
import TestScreen from '@local/components/TestScreen'

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
  },

  {
    initialRouteName: 'Home', // todo: change back to home
  }
);

const AppContainer = createAppContainer(NavigationStack);
export default AppContainer;