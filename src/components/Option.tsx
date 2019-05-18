import React from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View, StyleSheetProperties, StyleProp, ViewStyle } from 'react-native';

import Colors from '../constants/Colors';

export interface BoolProps {
  optionText: string

  style?: StyleProp<ViewStyle>

  getter: () => Promise<boolean> | boolean
  setter: (value: boolean) => any
  onStateChange?: (value: boolean) => any
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
        this.switchStateTo(value);
      })
    }
  }

  switchStateTo(enabled: boolean) {
    this.props.setter(enabled);
    this.setState({enabled: enabled});

    if (this.props.onStateChange) {
      this.props.onStateChange(enabled);
    }
  }

  render() {
    const switchFunc = () => this.switchStateTo(!this.state.enabled);
    const valueText = this.state.enabled ? "Yes" : "No";
    const style = this.state.enabled ? styles.yes : styles.no;

    return (
      <View style={[styles.inline, this.props.style]}>
        <Text style={styles.optionText}>{this.props.optionText}
          <Text style={style} onPress={switchFunc}> {valueText}</Text>
        </Text>
      </View>
    )
  }
}

export interface ClickProps {
  optionText: string
  action: () => any

  style?: StyleProp<ViewStyle>
};

interface ClickState {}

export class ClickOption extends Component<ClickProps, ClickState> {
  render() {
    return (
      <View style={styles.inline}>
        <Text style={styles.optionText}>{this.props.optionText}
        <Text style={styles.press} onPress={this.props.action}> Sure</Text></Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    marginBottom: 10,
  },

  optionText: {
    fontSize: 20,
    lineHeight: 23,
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
    color: Colors.darkYellow,
  },
})