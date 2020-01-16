
import React, {Component} from 'react'
import {
  StyleSheet,
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native'


import * as firebase from 'firebase'


import Slider from '@ptomasroos/react-native-multi-slider'
import CircleImage from '../components/circleImage'

const defaultPic = 'https://firebasestorage.googleapis.com/v0/b/clonetinder-c7909.appspot.com/o/defaultProfile.png?alt=media&token=177bc977-88ae-44b8-a80a-cda8afd21d0e'

export default class Profile extends Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    image: null,
    uploading: false,
    ageRange: [18,25],
    distance: 5,
    user: {
      name: 'Name',
      id:0,
      accountType: ''
    },
    profilePic: null
  }

  async componentDidMount() {
    // await Permissions.askAsync(Permissions.CAMERA_ROLL);
    // await Permissions.askAsync(Permissions.CAMERA);
  }

  componentWillMount() {
    console.log('componentWillMount')
    const {uid} = firebase.auth().currentUser
    console.log('componentWillMount', uid)
    firebase.database().ref('users').child(uid).on('value', snap => {
      const user = snap.val()
      const profilePicName = user.images ? Object.values(user.images)[0].url : false
      console.log('profilePicName', profilePicName)
      this.setState({user, distance: user.distance, ageRange: user.ageRange})
      if (profilePicName) {
        this.downloadImage(uid, profilePicName)
      }
      console.log('setState', user)
    })
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

  updateUser = (key, value) => {
    const {uid} = this.state.user
    firebase.database().ref('users').child(uid)
      .update({[key]:value})
  }


  render() {
    const {id, partner, ageRange, accountType, uid, currentLocation} = this.state.user
    const {user} = this.state
    const isCouple = accountType.indexOf('&') > -1 ? true : false
    const names = isCouple ? user.name + ' & ' + user.partner.name : user.name
    const orientation = isCouple ?  user.orientation + ' & ' + user.partner.orientation : user.orientation
    const profilePic = this.state.profilePic != null ? this.state.profilePic : defaultPic

    return (
      <View style={styles.container}>
        <View style={styles.profile}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Photos', {uid})}>
            <Image
              source={{uri:profilePic}}
              style={{width:120, height:120, borderRadius:120 / 2}}
            />
          </TouchableOpacity>
          <Text
            onPress={() => this.props.navigation.navigate('Prefs')}
            style={{fontSize:20}}>{names}</Text>
          <Text
            onPress={() => this.props.navigation.navigate('Prefs')}
            style={{fontSize:15, color:'darkgrey'}}>{orientation} ✏️
          </Text>
          <Text
            style={{fontSize:10, color:'#F15959', margin: 10}}>
            {currentLocation != null ? `📍 ${currentLocation.city}, ${currentLocation.country}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => firebase.auth().signOut()}
          style={{backgroundColor:'transparent', alignItems:'center', justifyContent:'center', margin:10}}>
          <Text style={{color:'grey'}}>logout</Text>
        </TouchableOpacity>
        <View style={styles.label}>
          <Text>Distance</Text>
          <Text style={{color:'darkgrey'}}>{this.state.distance}km</Text>
        </View>
        <View style={{alignItems:'center'}}>
          <Slider
            min={1}
            max={30}
            values={[this.state.distance]}
            onValuesChange={val => this.setState({distance:val})}
            onValuesChangeFinish={val => this.updateUser('distance', val[0])}
          />
        </View>
        <View style={styles.label}>
          <Text>Age Range</Text>
          <Text style={{color:'darkgrey'}}>{this.state.ageRange.join('-')}</Text>
        </View>
        <View style={{alignItems:'center'}}>
          <Slider
            min={18}
            max={70}
            values={this.state.ageRange}
            onValuesChange={val => this.setState({ageRange:val})}
            onValuesChangeFinish={val => this.updateUser('ageRange', val)}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:'white',
    // alignItems: 'center',
  },
  profile: {
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
  label: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginLeft:20,
    marginRight:20,
  },
  switch: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    margin:20,
  },
})
