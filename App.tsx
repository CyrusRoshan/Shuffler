/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React from 'react';
import { Component } from 'react';
import { Platform, StyleSheet, Text, ScrollView, View } from 'react-native';
import { iOSUIKit } from 'react-native-typography';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { Post } from './components/Post';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Text style={[iOSUIKit.largeTitleEmphasized, styles.title]}>Random Saves</Text>
        <View style={{flex:1}}>
        <ScrollView 
        showsVerticalScrollIndicator={true}
        style={styles.scroll} >
          <View style={styles.postContainer}>
            <Post style={styles.post} title='Here 1' url='test'></Post>
            <Post style={styles.post} title='Here 2' url='test2'></Post>
            <Post style={styles.post} title='Here 3' url='test2'></Post>
            <Post style={styles.post} title='Here 4' url='test2'></Post>
            <Post style={styles.post} title='Here 5' url='test'></Post>
            <Post style={styles.post} title='Here 6' url='test'></Post>
            <Post style={styles.post} title='Here 7' url='test2'></Post>
          </View>
        </ScrollView>
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
    backgroundColor: '#F5FCFF',
    flex: 1,
  },
  scroll: {
    height: '100%',
    flex: 1,
  },
  postContainer: {
    padding: 20,
    paddingTop: 5,
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    marginLeft: 20,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  post: {
    marginBottom: 20,
  },
});
