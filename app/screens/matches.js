import React, {Component} from 'react'
import {
  ListView,
  Text,
  View,
  TouchableHighlight,
} from 'react-native'

import * as firebase from 'firebase'
import _ from 'lodash'

import CircleImage from '../components/circleImage'

export default class Matches extends Component {
  static navigationOptions = {
    header: null,
  };
  
  state = {
    dataSource: new ListView.DataSource({rowHasChanged: (oldRow, newRow) => oldRow !== newRow }),
    matches: [],
    user: null,
    uid: firebase.auth().currentUser.uid
  }

  componentWillMount() {
    this.getMatches(this.state.uid)
    firebase.database().ref('users').child(this.state.uid).on('value', snap => {
      const user = snap.val()
      this.setState({user})
    })
  }

  getOverlap = (liked, likedBack) => {
    const likedTrue = _.pickBy(liked, value => value)
    const likedBackTrue = _.pickBy(likedBack, value => value)
    return _.intersection(_.keys(likedTrue), _.keys(likedBackTrue))
  }

  getUser = (uid) => {
    return firebase.database().ref('users').child(uid).once('value')
      .then(snap => snap.val())
  }

  getMatches = (uid) => {
    firebase.database().ref('relationships').child(uid).on('value', snap => {
      const relations = snap.val() || []
      const allMatches = this.getOverlap(relations.liked, relations.likedBack)
      console.log('allMatches', allMatches)
      const promises = allMatches.map(profileUid => {
        const foundProfile = _.find(this.state.matches, profile => profile.uid === profileUid)
        return foundProfile ? foundProfile : this.getUser(profileUid)
      })
      Promise.all(promises).then(data => this.setState({
        dataSource: this.state.dataSource.cloneWithRows(data),
        matches: data,
      }))
    })
  }

  renderRow = (rowData) => {
    const {id, name, partner, accountType, uid} = rowData
    const hasPartner = accountType.indexOf('&') > -1 ? true : false
    const combinedName = hasPartner ? name + ' & ' + partner.name : name
    const profilePicName = Object.values(rowData.images)[0].url
    return (
      <TouchableHighlight
        onPress={() => this.props.navigation.navigate('Chat', {user:this.state.user, profile: rowData})} >
        <View style={{flexDirection:'row', backgroundColor:'white', padding:10}} >
          <CircleImage size={80} uid={uid} name={profilePicName} />
          <View style={{justifyContent:'center', marginLeft:10}} >
            <Text style={{fontSize:18}} >{combinedName}</Text>
            <Text style={{fontSize:15, color:'darkgrey'}} >{accountType}</Text>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  renderSeparator = (sectionID, rowID) => {
    return (
      <View key={rowID} style={{height:1, backgroundColor:'whitesmoke', marginLeft:100}} />
    ) 
  }

  render() {
    return (
      <ListView
        style={{flex:1, backgroundColor:'white'}}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        renderSeparator={this.renderSeparator}
        enableEmptySections
      />
    )
  }
}


