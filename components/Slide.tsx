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

import Colors from '../constants/Colors';
import Feather from 'react-native-vector-icons/Feather';

export interface Props {
  title: string
  favorited: boolean
  uri: string
  username: string
  subreddit: string
}

interface State {
  favorited: boolean,
  slideWidth: number,
  widthFitter: object
  heightFitter: object
}

const SLIDEPADDING = 10;
const IMAGEPADDING = 0;

const SLIDECOLOR = Colors.darkBlack;
const TEXTCOLOR = Colors.lightWhite;

export default class Slide extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const windowWidth = Dimensions.get('window').width// - (2 * padding);

    this.state = {
      favorited: props.favorited,
      slideWidth: (windowWidth - SLIDEPADDING * 2),
      widthFitter: {
        paddingLeft: SLIDEPADDING,
        paddingRight: SLIDEPADDING,
        width: windowWidth,
        minWidth: windowWidth,
      },
      heightFitter: {},
    }
  }

  componentWillMount() {
    Image.getSize(this.props.uri, (width, height) => {
      const newImageHeight = (this.state.slideWidth - IMAGEPADDING * 2) * (height / width);

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
      <View style={[styles.root, this.state.widthFitter]}>
        <View style={styles.header}>
          <Text
            style={styles.title}
            adjustsFontSizeToFit={true}
            numberOfLines={2}
            >
            {this.props.title}
          </Text>

          <View style={styles.favoriteIconBox}>
            <Feather style={styles.favoriteIcon} name='heart' size={35} color={Colors.white} />
          </View>
        </View>

        <View style={styles.imageContainer}>
          <TouchableOpacity>
            <Image style={[styles.image, this.state.heightFitter]}
              source={{
                uri: this.props.uri,
                cache: 'force-cache',
              }}
              resizeMode='contain'
            ></Image>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.footerPart, styles.leftFooter]}>
            <Text
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              style={styles.footerText}
            >
              /u/{this.props.username}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.footerPart, styles.rightFooter]}>
            <Text
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              style={styles.footerText}
            >
              /r/{this.props.subreddit}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

// styles
const styles = StyleSheet.create({
  root: {
    marginTop: 5,
    marginBottom: 10,

    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    backgroundColor: SLIDECOLOR,

    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  favoriteIconBox: {
    height: '100%',
    padding: 10,
    backgroundColor: Colors.darkRed,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  favoriteIcon: {
    flex: 1,
    marginTop: 3,
  },

  imageContainer: {
    width: '100%',
    paddingLeft: IMAGEPADDING,
    paddingRight: IMAGEPADDING,
    backgroundColor: SLIDECOLOR,
  },

  image: {
    flex: 1,
    width: '100%',
  },

  title: {
    padding: 0,
    paddingLeft: 10,
    paddingRight: 5,
    flex: 1,

    fontFamily: 'Verdana',
    fontWeight: '900',
    textAlign: 'left',
    color: TEXTCOLOR,
    fontSize: 28,
  },

  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  footerPart: {
    padding: 5,
    paddingLeft: 7,
    paddingTop: 7,
    paddingBottom: 7,
  },

  leftFooter: {
    flex: 1,
    backgroundColor: Colors.darkBlue,
    borderBottomLeftRadius: 10,
  },

  rightFooter: {
    flex: 1,
    backgroundColor: Colors.darkPurple,
    borderBottomRightRadius: 10,
  },

  footerText: {
    fontWeight: '600',
    color: TEXTCOLOR,
    fontSize: 16,
  }
})