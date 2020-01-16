import firebase from 'firebase'
import React, {Component} from 'react'
import {View, StyleSheet, ActivityIndicator, StatusBar} from 'react-native'

export default class AuthLoading extends Component {

  componentDidMount() {
    StatusBar.setHidden(true)
    // firebase.auth().signOut()
    // this.props.navigation.navigate('Home')
    firebase.auth().onAuthStateChanged(auth => {
      if (auth) {
        this.firebaseRef = firebase.database().ref('users')
        this.firebaseRef.child(auth.uid).on('value', snap => {
          const user = snap.val()
          if (user != null) {
            this.firebaseRef.child(auth.uid).off('value')
            this.props.navigation.navigate('Home')
            // console.log('user', user)
          }
        })
      } else {
        this.props.navigation.navigate('Auth')
        // this.goToLogin()
      }
    })
  }

  authenticate = (token) => {
    const provider = firebase.auth.FacebookAuthProvider
    const credential = provider.credential(token)
    return firebase.auth().signInAndRetrieveDataWithCredential(credential)
  }

  render() {
    return (
      <View style={styles.container}>
          <ActivityIndicator animating={true} />
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
