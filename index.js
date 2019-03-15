/**
 * @format
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import {AppRegistry} from 'react-native';
import App from '@local/App';
import {name as appName} from '@local/app.json';

AppRegistry.registerComponent(appName, () => App);
