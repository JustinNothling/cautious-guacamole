import React, {Component} from 'react'
import {Image, PixelRatio} from 'react-native'

const defaultPic = 'https://firebasestorage.googleapis.com/v0/b/clonetinder-c7909.appspot.com/o/defaultProfile.png?alt=media&token=177bc977-88ae-44b8-a80a-cda8afd21d0e'
import * as firebase from 'firebase'

export default class CircleImage extends Component {
  state = {
    profilePic : null,
  }

  componentWillMount() {
    this.downloadImage(this.props.uid, this.props.name)
  }

  downloadImage = async (uid, name) => {
    const storageRef = firebase.storage().ref();
    const starsRef = storageRef.child(uid + '/' + name);

    starsRef.getDownloadURL().then((url) => {
      // Insert url into an <img> tag to "download"
      this.setState({profilePic: url})
      // this.setState({testUrl:url}) 
      console.log('url', url)
    }).catch(function(error) {
      console.log('eror', error)
    })
  }

  render() {
    const {size, uid, name} = this.props
    const imageSize = PixelRatio.getPixelSizeForLayoutSize(size)
    const profilePic = this.state.profilePic != null ? this.state.profilePic : defaultPic

    return (
      <Image
        source={{uri:profilePic}}
        style={{width:size, height:size, borderRadius:size / 2}}
      />
    )
  }
}
