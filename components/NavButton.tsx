import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from 'react-native';

import Colors from '@local/constants/Colors';

export interface Style {
  iconBackgroundColor: string
  backgroundColor: string
  titleColor: string,
}

export interface Props {
  title: string
  icon: React.ClassicElement<any>
  styleOptions?: Style
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

    if (this.props.styleOptions) {
      iconBackgroundColor = {backgroundColor: this.props.styleOptions.iconBackgroundColor}
      backgroundColor = {backgroundColor: this.props.styleOptions.backgroundColor}
      titleColor = {color: this.props.styleOptions.titleColor}
    }

    return (
      <TouchableOpacity style={[styles.root, backgroundColor]} onPress={this.props.onPress}>
        <View style={styles.container}>
          <View style={[styles.iconBox, iconBackgroundColor]}>
            {this.props.icon}
          </View>

          <Text style={[styles.title, titleColor]}>
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

    backgroundColor: Colors.darkBlack,
  },

  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  iconBox: {
    padding: 7,
    borderRadius: 5,

    backgroundColor: Colors.darkGray,
  },

  title: {
    fontFamily: 'Verdana',
    textAlign: 'left',
    color: Colors.lightWhite,
    fontSize: 26,

    padding: 5,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 3,
  },
})