console.ignoredYellowBox = ['Warning: Failed prop type: Invalid prop `keyboardShouldPersistTaps`']

import React, {Component} from 'react'
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity
} from 'react-native'

import * as firebase from 'firebase'
import Icon from '@expo/vector-icons/MaterialCommunityIcons'
import ModalSelector from 'react-native-modal-selector'

import {GiftedChat} from 'react-native-gifted-chat'

export default class Chat extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Chat',
      headerRight: (
          <ModalSelector
            ref={instance => this.dropDownPicker = instance} 
            data={[
              { key: '1', label: 'Report' },
              { key: '2', label: 'Unmatch' },
            ]}
            touchableStyle={{flex:1, flexDirection:'row', backgroundColor:'transparent', alignItems:'center'}}
            childrenContainerStyle = {{flex:1, flexDirection:'row', alignItems:'center'}}
            onChange={navigation.getParam('handleReport')}>
            <TouchableOpacity
              style={{flex:1, marginRight: 15}}
              onPress={() => console.log('est')}>
              <Icon name={'flag-variant'} size={25} color={'#F15959'} />
            </TouchableOpacity>
          </ModalSelector>
      )
    }
  };

  state={
    messages:[],
    user: this.props.navigation.getParam('user'),
    profile: this.props.navigation.getParam('profile'),
  }

  relate = (userUid, profileUid, status) => {
    let relationUpdate = {}
    relationUpdate[`${userUid}/liked/${profileUid}`] = status
    relationUpdate[`${profileUid}/likedBack/${userUid}`] = status

    firebase.database().ref('relationships').update(relationUpdate)
  }

  handleReport = (item) => {
    
    if (item.label == 'Unmatch' || true) {
      const {user, profile} = this.state
      this.relate(user.uid, profile.uid, false)
      this.props.navigation.goBack()
    } else if (item.label == 'Report') {

    }
  }

  componentDidMount() {
    this.props.navigation.setParams({ handleReport: this.handleReport });
  }


  componentWillMount() {
    const {user, profile} = this.state
    this.chatID = user.uid > profile.uid ? user.uid + '-' + profile.uid : profile.uid + '-' + user.uid
    this.watchChat()
  }

  watchChat = () => {
    firebase.database().ref('messages').child(this.chatID).on('value', snap => {
      let messages = []
      snap.forEach(message => {
        messages.push(message.val())
      })
      messages.reverse()
      this.setState({messages})
    })
  }

  onSend = (message) => {
    firebase.database().ref('messages').child(this.chatID)
      .push({
        ...message[0],
        createdAt: new Date().getTime(),
      })
  }

  render() {
    const avatar = `https://graph.facebook.com/${this.state.user.id}/picture?height=80`
    return (

      <GiftedChat
        messages={this.state.messages}
        user={{_id: this.state.user.uid, avatar}}
        onSend={this.onSend}
      />

    )
  }
}
