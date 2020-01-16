import firebase from 'firebase'
import React, {Component} from 'react'
import {View, StyleSheet, ActivityIndicator, Text, Linking} from 'react-native'
import FacebookButton from '../components/facebookButton'
import { Facebook } from 'expo';
import config from '/config'

export default class Login extends Component {

  state = {
    showSpinner: false,
  }

  authenticate = (token) => {
    const provider = firebase.auth.FacebookAuthProvider
    const credential = provider.credential(token)
    return firebase.auth().signInAndRetrieveDataWithCredential(credential)
  }

  createUser = (uid, userData) => {
    console.log('userData', userData)
    // const accountTypeName = userData.gender ? 'Single ' + userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Single Male'
    const accountTypeName = 'Single Male'

    const defaults = {
      uid,
      accountType: accountTypeName,
      birthday: "01/01/1990",
      distance: 5,
      ageRange: [18, 24],
      gender: 'Male',
      orientation: '-',
      lookingFor: {
        'Male & Female Couple': true,
        'Male & Male Couple': false,
        'Female & Female Couple': false,
        'Single Male': false,
        'Single Female': false,
        'Trans': false,
      },
      partner: {
        orientation: '-',
        birthday: "01/01/1990",
        gender: 'Male',
        name: '-',
      },
      name: userData.first_name
    }
    // const capGender = userData.gender ? userData.gender.charAt(0).toUpperCase() + gender.slice(1) : "Male"
    
    firebase.database().ref('users').child(uid).update({...defaults, ...userData})
  }

  login = async () => {
    console.log('logging in')
    this.setState({showSpinner:true})
    const APP_ID = config.FB_APP_ID
    const options = {
      permissions: ['public_profile', 'email'],
    }
    const {type, token} = await Facebook.logInWithReadPermissionsAsync(APP_ID, options)
    console.log('type token', type, token)
    if (type === 'success') {
      console.log('logging in success')
      const fields = ['id', 'first_name', 'last_name', 'gender', 'birthday']
      const response = await fetch(`https://graph.facebook.com/me?fields=${fields.toString()}&access_token=${token}`)
      const userData = await response.json()
      // const {uid} = await this.authenticate(token)
      const authRes = await this.authenticate(token)
      console.log('authRes UID', authRes.user.uid)
      this.createUser(authRes.user.uid, userData)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
          {this.state.showSpinner ?
            <ActivityIndicator animating={this.state.showSpinner} /> :
            <FacebookButton onPress={this.login} />
          }
        </View>
        <Text style ={{fontSize: 12, color:'darkgray', margin:3}}>By continuing, you agree to our</Text>
        <Text
          onPress={() => Linking.openURL('https://3some.co/')}
          style ={{fontSize: 12, color:'dimgray', margin:3, marginBottom:5}}>Terms of Use & Privacy Policy</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
