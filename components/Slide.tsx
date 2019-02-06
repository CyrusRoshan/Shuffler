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
  Dimensions,
  LayoutChangeEvent,
  ImageLoadEventData
} from 'react-native';

import { iOSUIKit, iOSColors } from 'react-native-typography';

export interface Props {
  title: string
  uri: string
  subtitle: string
}

interface State {
  slideWidth: number,
  widthFitter: object
  heightFitter: object
}


export default class Slide extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const padding = 10;
    const windowWidth = Dimensions.get('window').width// - (2 * padding);

    this.state = {
      slideWidth: (windowWidth - padding * 2),
      widthFitter: {
        paddingLeft: padding,
        paddingRight: padding,
        width: windowWidth,
        minWidth: windowWidth,
      },
      heightFitter: {},
    }
  }

  componentWillMount() {
    Image.getSize(this.props.uri, (width, height) => {
      const newImageHeight = (this.state.slideWidth) * (height / width);

      this.setState({
        heightFitter: {
          flex: 0,
          height: newImageHeight,
        },
      })
    }, (error) => {

    });
  }

  render() {
    return (
      <TouchableOpacity style={[styles.root, this.state.widthFitter]}>
        <View style={styles.container}>
          <Text style={[iOSUIKit.title3, styles.title]}>
            Title: {this.props.title}
          </Text>

          <Image style={[styles.image, this.state.heightFitter]}
            source={{
              uri: this.props.uri,
              cache: 'force-cache',
            }}
            resizeMode='contain'
          ></Image>

          <Text style={iOSUIKit.subheadEmphasizedWhite}>
            Subtitle: {this.props.subtitle}
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
    flex: 1,
  },

  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    flex: 1,
    width: '100%',
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