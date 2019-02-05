import { createStackNavigator, createAppContainer } from 'react-navigation';

import HomeScreen from './components/HomeScreen'

const NavigationStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        header: null,
      },
    },

    AllSaved: {
      screen: HomeScreen, // todo: change
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
    initialRouteName: 'Home',
  }
);

const AppContainer = createAppContainer(NavigationStack);
export default AppContainer;