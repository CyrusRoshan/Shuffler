import React from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View, StyleSheetProperties, StyleProp, ViewStyle, Switch, Button } from 'react-native';

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

    return (
      <View style={[styles.inline, this.props.style]}>
        <Text style={styles.optionText}>{this.props.optionText}</Text>
        <Switch
        value={this.state.enabled}
        onValueChange={switchFunc}
        trackColor={{
          true: Colors.lightBlue,
          false: Colors.darkWhite,
        }}
        thumbColor={Colors.lightWhite}
        />
      </View>
    )
  }
}

export interface ClickProps {
  optionText: string
  action: () => any
  dangerLevel?: 0 | 1 | 2

  style?: StyleProp<ViewStyle>
};

interface ClickState {}

export class ClickOption extends Component<ClickProps, ClickState> {
  render() {
    const dangerLevels = [
      Colors.lightBlue,
      Colors.lightYellow,
      Colors.lightRed,
    ]
    const dangerColor = dangerLevels[this.props.dangerLevel || 0];

    return (
      <View style={{
        justifyContent: 'center',
        marginTop: -2,
        marginBottom: -2,
      }}>
        <Button
          onPress={this.props.action}
          title={this.props.optionText}
          color={dangerColor}
          accessibilityLabel={this.props.optionText}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    alignItems: 'center',

    width: '100%',
    marginBottom: 10,
  },

  optionText: {
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '500',
    color: Colors.darkWhite,

    marginBottom: 0,

    alignSelf: 'center',
    flexGrow: 1,
    flex: 1,
  },

  buttonText: {
    fontSize: 20,
    fontWeight: '900',

    marginBottom: 0,
    marginLeft: 10,

    alignSelf: 'flex-start',
    flexGrow: 0,
    flexShrink: 0,
  },
})