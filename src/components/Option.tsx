import React, { ReactNode } from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';

import Colors from '../constants/Colors';

// TODO: add loading bar
// TODO: add option for downloading image data
// TODO: save image data to AsyncStorage using IMAGE_PREFIX prefix + post ID as the key,
// TODO: when fetching images for the first time

export interface BoolProps {
  optionText: string

  getter: () => Promise<boolean> | boolean
  setter: (value: boolean) => any
};

interface BoolState {
  enabled: boolean
}

export class BooleanOption extends Component<BoolProps, BoolState> {
  constructor(props: BoolProps) {
    super(props);

    const getter = this.props.getter()
    if (typeof getter === "boolean") {
      this.state = {
        enabled: getter,
      }
    } else {
      this.state = {
        enabled: false
      };

      getter.then(value => {
        this.setState({
          enabled: value
        })
      })
    }
    console.log(this.state)
  }

  switchState(enabled: boolean) {
    this.props.setter(!enabled);
    this.setState({enabled: !enabled});
  }

  render() {
    const switchFunc = () => this.switchState(this.state.enabled);
    const valueText = this.state.enabled ? "Yes" : "No";
    const style = this.state.enabled ? styles.yes : styles.no;

    return (
      <View style={styles.inline}>
        <Text style={styles.optionText}>{this.props.optionText} <Text style={style} onPress={switchFunc}>{valueText}</Text></Text>
      </View>
    )
  }
}

export interface ClickProps {
  optionText: string
  action: () => any
};

interface ClickState {}

export class ClickOption extends Component<ClickProps, ClickState> {
  render() {
    return (
      <View style={styles.inline}>
        <Text style={styles.optionText}>{this.props.optionText} <Text style={styles.press} onPress={this.props.action}>Sure</Text></Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    width: '70%',
    alignSelf: 'center',
    marginBottom: 5,
  },

  optionText: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500',

    marginBottom: 0,

    alignSelf: 'stretch',
    color: Colors.darkWhite,
  },

  press: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500',

    marginBottom: 0,

    alignSelf: 'stretch',
    color: Colors.lightBlue,
  },

  yes: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500',

    marginBottom: 0,

    alignSelf: 'stretch',
    color: Colors.lightGreen,
  },

  no: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500',

    marginBottom: 0,

    alignSelf: 'stretch',
    color: Colors.lightOrange,
  },
})