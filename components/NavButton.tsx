import React from 'react';
import {
  Image,
  Button,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from 'react-native';

import { iOSUIKit, iOSColors } from 'react-native-typography';

export interface Style {
  iconBackgroundColor: string
  backgroundColor: string
  titleColor: string,
}

export interface Props {
  title: string
  icon: React.ClassicElement<any>
  style?: Style
  onPress?: (event: NativeSyntheticEvent<NativeTouchEvent>) => void
}

export default class NavButton extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  render() {
    let iconBackgroundColor = undefined;
    let backgroundColor = undefined;
    let titleColor = undefined;

    if (this.props.style) {
      iconBackgroundColor = {backgroundColor: this.props.style.iconBackgroundColor}
      backgroundColor = {backgroundColor: this.props.style.backgroundColor}
      titleColor = {color: this.props.style.titleColor}
    }

    return (
      <TouchableOpacity style={[styles.root, backgroundColor]} onPress={this.props.onPress}>
        <View style={styles.container}>
          <View style={[styles.iconBox, iconBackgroundColor]}>
            {this.props.icon}
          </View>

          <Text style={[iOSUIKit.title3, styles.title, titleColor]}>
            {this.props.title}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

// styles
const styles = StyleSheet.create({
  root: {
    marginTop: 5,
    marginBottom: 10,

    backgroundColor: iOSColors.black,
  },

  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  iconBox: {
    padding: 7,
    borderRadius: 5,

    backgroundColor: iOSColors.gray,
  },

  title: {
    fontFamily: 'Verdana',
    textAlign: 'left',
    color: iOSColors.white,
    fontSize: 26,

    padding: 5,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 5,
  },
})