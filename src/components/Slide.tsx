import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import Colors from '../constants/Colors';

export interface Props {
  title: string
  uri: string
  username?: string
  subreddit: string
  postAge: string
}

interface State {
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
      slideWidth: (windowWidth - SLIDEPADDING * 2),
      widthFitter: {
        padding: SLIDEPADDING,
        width: windowWidth,
        minWidth: windowWidth,
      },
      heightFitter: {},
    }

    Image.getSize(this.props.uri, (width, height) => {
      const newImageHeight = (this.state.slideWidth - IMAGEPADDING * 2) * (height / width);

      this.setState({
        heightFitter: {
          flex: 0,
          height: newImageHeight,
        },
      })
    }, (err) => {console.log(err)});
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

        <View style={styles.postInfo}>
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
              style={[styles.footerText, styles.postAge]}
            >
              {this.props.postAge}
            </Text>
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
      </View>
    )
  }
}

// styles
const styles = StyleSheet.create({
  root: {
    marginTop: 5,
    paddingBottom: 10,

    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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

    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  image: {
    borderRadius: 10,
    flex: 1,
    width: '100%',
  },

  postInfo: {
    flex: 1,
    backgroundColor: SLIDECOLOR,
    flexDirection: 'row',
    alignItems: 'center',
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

  postAge: {
    paddingRight: 10,
  },

  combiner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
})