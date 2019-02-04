// components/Post.tsx
import React from 'react'
import { 
  Image, 
  Button, 
  StyleSheet, 
  Text, 
  View,
  TouchableOpacity,
  ImageBackground,
} from 'react-native'
import { iOSUIKit, iOSColors } from 'react-native-typography';
import FitImage from 'react-native-fit-image';

export interface Props {
  title: string
  url: string
  favorited?: boolean
  style?: object
  onToggleFavorite?: () => void
}

interface State {
  favorited: boolean
}

export class Post extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    // TODO: catch url errors here

    this.state = {
      favorited: props.favorited || false,
    }
  }

  // TODO: add some gesture for favoriting images and text posts

  // TODO: make this cache images and text posts for offline
  onToggleFavorite = () => this.setState({ favorited: !this.state.favorited });

  render() {
    return (
      <View style={[styles.root, this.props.style]}>
        <Text style={[iOSUIKit.title3White, styles.title]}>
          {this.props.title}
        </Text>

        <TouchableOpacity style={styles.imageContainer}>
          <FitImage
            source={{
              uri: 'https://via.placeholder.com/72x120.png',
              method: 'GET',
              headers: {},
              cache: 'force-cache',
            }}
            borderRadius={5}
            style={styles.innerImage}
            resizeMode='contain'
          />
        </TouchableOpacity>
      </View>
    )
  }
}
// styles
const styles = StyleSheet.create({
  root: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: iOSColors.black,
  },

  title: {
    paddingTop: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },

  imageContainer: {
    padding: 5,
  },
  
  innerImage: {
    borderRadius: 5,
  },
})