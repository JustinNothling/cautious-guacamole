import firebase from 'firebase'
import React, {Component} from 'react'
import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, Modal, TouchableHighlight, Alert} from 'react-native';
import { Constants, Location, Permissions, Asset, FileSystem } from 'expo';
import {GeoFire} from 'geofire'
const {width, height} = Dimensions.get('window')


import SimpleScroller from '../components/simpleScroller'
import Card from '../components/card'

import Screen from './screen'

import filter from '../modules/filter'
import EULAtext from '../../assets/eula'
// const EULAname = Asset.fromModule(require('../../assets/icon.png'))
// console.log('EULAname', EULAname)
// const EULAtext = FileSystem.readAsStringAsync(EULAname)


export default class Home extends Component {
  // render() {
  //   const user = this.props.navigation.getParam('user')
  //   console.log('userhome', user)
  //   return (
  //     <View style={styles.container}>
  //       <Text onPress={() => firebase.auth().signOut()}>Hello {user.first_name}!</Text>
  //     </View>
  //   );
  // }
//   static navigationOptions = {
//     tabBarIcon: (focused, tintColor) => (
//       <Image style={{ width: 20, height: 30 }} 
//              source={require('../../img/3red.png')} />
//     )
// }

  state = {
    profileIndex: 0,
    profiles: [],
    user: null,
    locationServices: false,
  }

  componentWillMount() {
    const {uid} = firebase.auth().currentUser
    this.updateUserLocation(uid)
    firebase.database().ref('users').child(uid).on('value', snap => {
      const user = snap.val()
      this.setState({
        user,
        profiles:[],
        profileIndex:0,
      })
      this.getProfiles(user.uid, user.distance)
      this.updateLocation(user.uid)
    })
  }

  getUser = (uid) => {
    return firebase.database().ref('users').child(uid).once('value')
  }

  getSwiped = (uid) => {
    return firebase.database().ref('relationships').child(uid).child('liked')
      .once('value')
      .then(snap => snap.val() || {})
  }

  getProfiles = async (uid, distance) => {
    const geoFireRef = new GeoFire(firebase.database().ref('geoData'))
    const userLocation = await geoFireRef.get(uid)
    const swipedProfiles = await this.getSwiped(uid)
    console.log('userLocation', userLocation)
    const geoQuery = geoFireRef.query({
      center: userLocation,
      radius: distance, //km
    })
    geoQuery.on('key_entered', async (uid, location, distance) => {
      console.log(uid + ' at ' + location + ' is ' + distance + 'km from the center')
      const user = await this.getUser(uid)
      // console.log(user.val())
      if (user.val() != null ) {
        const profiles = [...this.state.profiles, user.val()]
        // console.log('profiles', profiles)
        const filtered = filter(profiles, this.state.user, swipedProfiles)
        this.setState({profiles: filtered})
      }

      // console.log('filtered', filtered)
    })
  }

  updateUser = (key, value) => {
    const {uid} = this.state.user
    firebase.database().ref('users').child(uid)
      .update({[key]:value})
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
          onPress: () => this.updateLocation(this.state.user.uid),
        },
      ],
      {cancelable: false},
    );
    // return statusR
  }

  updateLocation = async (uid) => {
    const {status} = await Permissions.askAsync(Permissions.LOCATION)
    if (status === 'granted') {
      console.log('granted')
      const location = await Location.getCurrentPositionAsync({enableHighAccuracy: false})
  
      // const {latitude, longitude} = location.coords
      console.log('Permission Granted', location.coords)
      const latitude = 37.39239 //demo lat
      const longitude = -122.09072 //demo lon
      console.log('this.state.user.name', this.state.user.name)
      const loc = this.state.user.name === 'Test321' ? [latitude, longitude] : [location.coords.latitude, location.coords.longitude]
      console.log('loc', loc)
      const geoFireRef = new GeoFire(firebase.database().ref('geoData'))
      const geotest = geoFireRef.set(uid, loc)
      // console.log('Permission Granted', location)
      // setTimeout(async () => {
        const locDet = {latitude:loc[0], longitude: loc[1]}
        const locationDetail = await Location.reverseGeocodeAsync(locDet);
        this.updateUser('currentLocation', locationDetail[0])
        console.log(locationDetail)
      // },3000);
  
    }

  }

  updateUserLocation = async (uid) => {
    const checkLocation =  await Location.hasServicesEnabledAsync(Permissions.LOCATION)
    console.log('checkLocation', checkLocation)

    if (checkLocation == true) {
      await this.updateLocation(uid)
    } else {
      console.log('no Permission yet')
      this.getPermisson('Location?', '3some would like access to your current location so that we can find people near you')
    }
  }

  cardStack = () => {
    const {profileIndex} = this.state
    const profilesToLoad = Math.min(this.state.profiles.length - profileIndex, 3)
    console.log('profilesToLoad', profilesToLoad)
    return (
      <View style={{flex:1}}>
        {this.state.profiles.slice(profileIndex, profileIndex + profilesToLoad).reverse().map((profile, i) => {
          return (
            <Card
              ref={profileIndex + (profilesToLoad - 1 -i)}
              key={profile.id}
              profile={profile}
              onSwipeOff={this.nextCard}
            />
          )
        })}
      </View>
    )
  }

  relate = (userUid, profileUid, status) => {
    let relationUpdate = {}
    relationUpdate[`${userUid}/liked/${profileUid}`] = status
    relationUpdate[`${profileUid}/likedBack/${userUid}`] = status

    firebase.database().ref('relationships').update(relationUpdate)
  }

  nextCard = (swipedRight, profileUid) => {
    const userUid = this.state.user.uid
    this.setState({profileIndex: this.state.profileIndex + 1})
    if (swipedRight) {
      this.relate(userUid, profileUid, true)
    } else {
      this.relate(userUid, profileUid, false)
    }
  }

  autoSwipeCard = (direction) => {
    const frontCard = this.state.profileIndex
    // if (this.refs[frontCard] != null)
    console.log('frontCard', frontCard)
    this.refs[frontCard].autoSwipe(direction)
  }

  buildButtons = () => {
    const {profileIndex, profiles} = this.state
    if ((profiles.length - profileIndex) > 0) {
      return(
        <View style={{flexDirection:'row', height:100, width, backgroundColor:'transparent', alignItems:'center', justifyContent:'center'}}>
          <TouchableOpacity
            style={{margin:15}}
            onPress={() => this.autoSwipeCard(false)}>
            <Image
              style={{width: 60, height: 60}}
              source={require('../../assets/x.png')}/>
          </TouchableOpacity>
          <TouchableOpacity
            style={{margin:15}}
            onPress={() => this.autoSwipeCard(true)}>
            <Image
              style={{width: 60, height: 60}}
              source={require('../../assets/Like.png')}/>
          </TouchableOpacity>
        </View>
      )
    } else {
      return (<View></View>)
    }

  }
  // 
  render() {
    const eula = this.state.user ? !this.state.user.EULA || false : false
    // const eulaText = eula ? Asset.loadAsync(require('../../assets/eula.txt')) : null
    return (
      <View style={{flex:1, backgroundColor:'#EEF2F5'}}>
        <Modal
          animationType="fade"
          transparent={false}
          visible={eula}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
        }}>
        <View style={{flex:1, opacity: 0.8, backgroundColor:'white'}}>
            <View>
              <Text style={{fontSize:15, margin:15, marginTop: 22}}>Terms of Use (EULA)</Text>
              <Text style={{fontSize:10, margin:15}} numberOfLines={35}>
                {EULAtext}
              </Text>
              <TouchableHighlight
                style={{alignItems:'center', justifyContent:'center'}}
                onPress={() => {
                  this.updateUser('EULA', true)
                }}>
                <Text style={{fontSize:15, margin:15, marginTop: 22}}>Accept</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
        {this.cardStack()}
        {this.buildButtons()}
      </View>
    )
  }
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });