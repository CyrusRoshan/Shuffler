import { createStackNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from './components/HomeScreen'
import AllSavedScreen from './components/AllSavedScreen'

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
  },

  {
    initialRouteName: 'AllSaved', // todo: change back to home
  }
);

const AppContainer = createAppContainer(NavigationStack);
export default AppContainer;