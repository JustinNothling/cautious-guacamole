import React, {Component} from 'react'
import {
  StyleSheet,
  View,
  Image,
  Text,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native'

import moment from 'moment'
import * as firebase from 'firebase'

const {width, height} = Dimensions.get('window')

const defaultPic = 'https://firebasestorage.googleapis.com/v0/b/clonetinder-c7909.appspot.com/o/defaultProfile.png?alt=media&token=177bc977-88ae-44b8-a80a-cda8afd21d0e'

const cardWidth = width - 20
const cardHeight = height - 100 - 80

export default class Card extends Component {
  state = {
    profilePic: null,
  }

  componentWillMount() {
    console.log('this.props.profile', this.props.profile)
    const pictures = this.props.profile.images ? Object.values(this.props.profile.images) : [{url:defaultPic}]
    console.log('pictures', pictures)
    const profilePicName = pictures[0].url

    // console.log('this.props.profile.images', this.props.profile.images)
    // console.log('pictures', pictures)
    // console.log('pictures', pictures)
    this.downloadImage(this.props.profile.uid, profilePicName)
    console.log('profilePicName', profilePicName)
    this.pan = new Animated.ValueXY()

    this.cardPanResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: Animated.event([
        null,
        {dx:this.pan.x, dy:this.pan.y},
      ]),
      onPanResponderRelease: (e, {dx}) => {
        const absDx = Math.abs(dx)
        const direction = absDx / dx
        const swipedRight = direction > 0

        if (absDx > 120) {
          Animated.decay(this.pan, {
            velocity: {x:3 * direction, y:0},
            deceleration: 0.995,
          }).start(() => this.props.onSwipeOff(swipedRight, this.props.profile.uid))
        } else {
          Animated.spring(this.pan, {
            toValue: {x:0, y:0},
            friction: 4.5,
          }).start()
        }
      },
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

  autoSwipe = (direction) => {
    const left = direction ? 1 : -1
    Animated.decay(this.pan, {
      velocity: {x:2.5 * left, y:0},
      deceleration: 0.995,
    }).start(() => this.props.onSwipeOff(direction, this.props.profile.uid))
  }

  buildInfoTab = () => {
    const {birthday, name, id, orientation, gender, accountType, partner} = this.props.profile
    const genderUpper = gender.charAt(0).toUpperCase() + gender.slice(1);
    const profileBday = moment(birthday, 'MM/DD/YYYY')
    const profileAge = moment().diff(profileBday, 'years')
    const fbImage = `https://graph.facebook.com/${id}/picture?height=500`
    if (accountType.indexOf('&') > -1) {
      const partnerName = partner.name
      const partnerOrientation = partner.orientation
      const partnerBirthday = moment(partner.birthday, 'MM/DD/YYYY')
      const partnerAge = moment().diff(profileBday, 'years')
      const partnerGender = partner.gender.charAt(0).toUpperCase() + partner.gender.slice(1);

      return (
        <View style={styles.infoTabPartner}>
          <View style={{flex:1}}>
            <Text style={{fontSize:20}}>{name}, {profileAge}</Text>
            <Text style={{fontSize:15, color:'darkgrey'}}>{orientation} {genderUpper}</Text>
          </View>
          <View style={{flex:1, borderLeftWidth:1, borderLeftColor:'#D8D8D8'}}>
            <Text style={{fontSize:20, paddingLeft:10}}>{partnerName}, {partnerAge}</Text>
            <Text style={{fontSize:15, color:'darkgrey', paddingLeft:10}}>{partnerOrientation} {partnerGender}</Text>
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.infoTab}>
          <Text style={{fontSize:20}}>{name}, {profileAge}</Text>
          <Text style={{fontSize:15, color:'darkgrey'}}>{orientation} {genderUpper}</Text>
        </View>
      )      
    }
  }

  render() {
    // const {id} = this.props.profile
    // const fbImage = `https://graph.facebook.com/${id}/picture?height=500`
    const profilePic = this.state.profilePic != null ? this.state.profilePic : defaultPic

    const rotateCard = this.pan.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: ['10deg', '0deg', '-10deg'],
    })
    const animatedStyle = {
      transform: [
        {translateX: this.pan.x},
        {translateY: this.pan.y},
        {rotate: rotateCard},
      ],
    }

    return (
      <Animated.View
        {...this.cardPanResponder.panHandlers}
        style={[styles.card, animatedStyle]}>
        <Image
          style={{flex:1}}
          source={{uri: profilePic}}
        />
        {this.buildInfoTab()}
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: width - 20,
    height: height - 100 - 80,
    top: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
    margin: 10,
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 8,
  },
  infoTab: {
    justifyContent: 'center',
    padding:5,
    paddingLeft:10,
    paddingRight:10,
    borderRadius: 8,
    height:60,
    width:cardWidth - 20,
    position:'absolute',
    backgroundColor:'white',
    left:10,
    top:cardHeight - 70,
  },
  infoTabPartner: {
    flexDirection:'row',
    alignItems: 'center',
    padding:5,
    paddingLeft:10,
    paddingRight:10,
    borderRadius: 8,
    height:60,
    width:cardWidth - 20,
    position:'absolute',
    backgroundColor:'white',
    left:10,
    top:cardHeight - 70,
  }
})
