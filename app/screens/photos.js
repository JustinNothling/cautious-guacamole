import React, { Component } from 'react';
//import react in our code.
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';

// import {Dimensions} from 'expo';
//import all the components we are going to use.

import { ImagePicker, Permissions } from 'expo';
import uuid from 'uuid';
import * as firebase from 'firebase'
var {height, width} = Dimensions.get('window');
import Icon from '@expo/vector-icons/Entypo'

export default class Prefs extends Component {
  static navigationOptions = {
    title: 'Photos',
  };

  state = {
    images: [],
    // url: 'https://firebasestorage.googleapis.com/v0/b/clonetinder-c7909.appspot.com/o/Y933Mf7MJASUq1ZBhzKceJNUahf2%2Fthumb%40128_adult-attractive-beautiful-905913.jpg?alt=media&token=6e4683ce-2138-4a0e-9859-d83bca4e23da'
  }


  componentDidMount() {
    console.log('componentWillMount')
    const {uid} = firebase.auth().currentUser
    console.log('componentWillMount', uid)
    firebase.database().ref('users/'+ uid).child('images').on('value', snap => {
      // let images = []
      // console.log('snap.numChildren()', snap.numChildren(), 'this.state.images.length', this.state.images.length )
      if (snap.numChildren() < this.state.images.length) {
        let newImages = this.state.images
        newImages.pop()
        this.setState({images:newImages})
      }

      let i = 0
      snap.forEach(image => {
        // images.push(image.val())
        // console.log('image.val()', image.val())
        // const url = 'thumb@256_' + image.val()
        this.downloadImage(uid, image.val(), i)
        i++
      })
      // const images = snap.val()

      // console.log('images', images)
      // this.setState({images})
      // console.log('setState', user)
    })
  }


  downloadImage = async (uid, name, pos) => {
    const storageRef = firebase.storage().ref();
    const starsRef = storageRef.child(uid + '/' + name.url);
    // const starsRef = storageRef.child(uid + '/thumb@256_' + name.url);

    starsRef.getDownloadURL().then((url) => {
      // Insert url into an <img> tag to "download"
      let newImages = this.state.images
      newImages[pos] = url
      this.setState({images: newImages})
      // this.setState({testUrl:url}) 
      console.log('url', url)
    }).catch(function(error) {
      console.log('eror', error)
    })
    
  // }
  // downloadImage = async (uid, name) => {
  //   const storageRef = firebase.storage().ref();
  //   const starsRef = storageRef.child(uid + '/' + name);
  //   const url = await starsRef.getDownloadURL()
  //   return url
    
  }

  buildImage = (i) => {
    // const {uid} = firebase.auth().currentUser
    // url = await this.downloadImage(uid, image)
    const {images} = this.state
    if (images[i]) {
      return (
        <TouchableOpacity key={i} style={{margin:5, marginTop:20}}>
          <Image
            style={{width: width / 4, height: width / 4}}
            source={{uri: images[i]}}
            />
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity
          key={i}
          onPress={() => this.getPermisson('Photos?', '3some would like access to your photos so that you can upload pictures of yourself to your profile')}
          style={{backgroundColor:'transparent', margin:5, marginTop:20, width: width / 4, height: width / 4, alignItems:'center', justifyContent:'center'}}>
          <Icon
            name={'squared-plus'}
            size={34}
            color={'grey'} />
        </TouchableOpacity>
      )
    }

  }

  getPermisson = (title, message) => {
    // let statusR = 'no'
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => this._pickImage(),
        },
      ],
      {cancelable: false},
    );
    // return statusR
  }

  _pickImage = async () => {
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      // aspect: [4, 3],
    });

    this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async pickerResult => {
    const {uid} = firebase.auth().currentUser
    try {
      this.setState({ uploading: true });

      if (!pickerResult.cancelled) {
        uploadUrl = await uploadImageAsync(pickerResult.uri, uid);
        this.setState({ image: uploadUrl });
      }
    } catch (e) {
      console.log(e);
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({ uploading: false });
    }
  };

  render() {
    const imgCount = [0,1,2,3,4,5]
    return (
      <View style={styles.container}>
        {imgCount.map(i => this.buildImage(i))}
      </View>
    )
  }
}

async function uploadImageAsync(uri, uid) {
  // Why are we using XMLHttpRequest? See:
  // https://github.com/expo/expo/issues/2402#issuecomment-443726662
  // const {uid} = this.state.user
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError('Network request failed'));
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const ref = firebase
    .storage()
    .ref(uid)
    .child(uuid.v4() + '.png');
    // .child('test.png');
  const snapshot = await ref.put(blob);

  // We're done with the blob, close and release it
  blob.close();

  return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    flexDirection:'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    flexWrap:'wrap'
  },
})