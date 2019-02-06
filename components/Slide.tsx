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

import Feather from 'react-native-vector-icons/Feather';

import Colors from '../constants/Colors';

export interface Props {
  title: string
  favorited: boolean
  uri: string
  username?: string
  subreddit: string
  postAge: string
}

interface State {
  favorited: boolean,
  slideWidth: number,
  widthFitter: object
  heightFitter: object
}

const SLIDEPADDING = 10;
const IMAGEPADDING = 10;

const SLIDECOLOR = Colors.lightBlack;
const TEXTCOLOR = Colors.lightWhite;

export default class Slide extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const windowWidth = Dimensions.get('window').width;

    this.state = {
      favorited: props.favorited,
      slideWidth: (windowWidth - SLIDEPADDING * 2),
      widthFitter: {
        padding: SLIDEPADDING,
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
          <TouchableOpacity>
            <Text
              style={styles.title}
              adjustsFontSizeToFit={true}
              numberOfLines={2}
              >
              {this.props.title}
            </Text>
          </TouchableOpacity>
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
          <View style={styles.footerInfo}>
            <TouchableOpacity style={styles.footerLink}>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.footerText}
              >
                {this.props.subreddit}
              </Text>
            </TouchableOpacity>

            <View style={styles.combiner}>
              <Feather style={styles.footerText} name='clock' size={35} color={Colors.white} />
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.footerText}
              >
                {this.props.postAge}
              </Text>
            </View>
          </View>

          <View style={styles.favoriteIconBox}>
            <TouchableOpacity>
              <Feather style={styles.favoriteIcon} name='heart' size={35} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

// styles
const styles = StyleSheet.create({
  root: {
    marginTop: 5,
    paddingBottom: 30,

    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    }
  },

  header: {
    backgroundColor: SLIDECOLOR,

    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  title: {
    paddingTop: 10,
    paddingLeft: 12,
    paddingRight: 12,
    flex: 1,

    fontWeight: '600',
    textAlign: 'left',
    color: TEXTCOLOR,
    fontSize: 30,
  },

  imageContainer: {
    width: '100%',
    padding: IMAGEPADDING,
    backgroundColor: SLIDECOLOR,
  },

  image: {
    borderRadius: 10,
    flex: 1,
    width: '100%',
  },

  footer: {
    backgroundColor: SLIDECOLOR,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  favoriteIconBox: {
    height: '100%',
    padding: 10,
    backgroundColor: Colors.darkGray,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  favoriteIcon: {
    flex: 1,
    fontSize: 20,
  },

  footerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
    justifyContent: 'flex-start',
  },

  footerLink: {
    paddingLeft: 15,
    flex: 2,
  },

  footerText: {
    paddingRight: 5,
    fontWeight: '600',
    color: TEXTCOLOR,
    fontSize: 20,
  },

  combiner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
})