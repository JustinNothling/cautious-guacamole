import React, { Component } from 'react';
//import react in our code.
import {
  StyleSheet,
  View,
  SectionList,
  Text,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
//import all the components we are going to use.

import * as firebase from 'firebase'
import moment from 'moment'
import DateTimePicker from "react-native-modal-datetime-picker";
import ModalSelector from 'react-native-modal-selector'


import Icon from '@expo/vector-icons/MaterialIcons'

const accountType = [
  { id: '1', value: 'Single Male' },
  { id: '2', value: 'Single Female' },
  { id: '3', value: 'Male & Female Couple' },
  { id: '4', value: 'Male & Male Couple' },
  { id: '5', value: 'Female & Female Couple' },
  { id: '6', value: 'Trans' },
]

const lookingFor = [
  { id: '7', label: 'Looking', value: 'Single Male' },
  { id: '8', label: 'Looking', value: 'Single Female' },
  { id: '9', label: 'Looking', value: 'Male & Female Couple' },
  { id: '10', label: 'Looking', value: 'Male & Male Couple' },
  { id: '11', label: 'Looking', value: 'Female & Female Couple' },
  { id: '12', label: 'Looking', value: 'Trans' },
]

const details = [
  { id: '13', label: 'Name', value: 'name'},
  { id: '14', label: 'Birthday', value: 'birthday' },
  { id: '15', label: 'Gender', value: 'gender' },
  { id: '16', label: 'Orientation', value: 'orientation' },
]

const partnerDetails = [
  { id: '17', label: "Name", value: 'partnersName' },
  { id: '18', label: "Birthday", value: 'partnersBirthday' },
  { id: '19', label: "Gender", value: 'partnersGender' },
  { id: '20', label: "Orientation", value: 'partnersOrientation' },
]

const sections =  [
  { title: 'I am/We are', data: accountType },
  { title: 'Looking for', data: lookingFor },
  { title: 'Your Details', data: details },
  { title: "Partner's Details", data: partnerDetails },
]


export default class Prefs extends Component {
  static navigationOptions = {
    title: 'Identity',
  };

  state = {
    isDatePickerVisible:false,
    isDatePickerVisiblePartner:false,
    name: '-',
    partnersName: '-',
    user: {
      accountType: '-',
      name: '-'
    }
  }

  showDatePicker = (type) => {
    this.setState({ [type]: true });
  }

  hideDatePicker = (type) => {
    this.setState({ [type]: false });
  }

  handleDatePicked = date => {
    const isPartner = this.state.isDatePickerVisiblePartner ? true : false
    const whichPicker = isPartner ? 'isDatePickerVisiblePartner' : 'isDatePickerVisible'
    console.log("A date has been picked: ", date);
    const formatedDate = moment(date).format('MM/DD/YYYY')
    console.log("A formatedDate has been picked: ", formatedDate);
    if (isPartner) {
      this.updatePartner('birthday', formatedDate)
    } else {
      this.updateUser('birthday', formatedDate)
    }
    
    this.hideDatePicker(whichPicker);
  };

  componentWillMount() {
    const {uid} = firebase.auth().currentUser
    firebase.database().ref('users').child(uid).on('value', snap => {
      const user = snap.val()
      const partnersName = user.partner ? user.partner.name : '-'
      this.setState({user, name:user.name, partnersName: partnersName})
    })
  }

  updateUser = (key, value) => {
    const {uid} = this.state.user
    firebase.database().ref('users').child(uid)
      .update({[key]:value})
  }

  updatePartner = (key, value) => {
    const {uid} = this.state.user
    firebase.database().ref('users').child(uid + '/partner')
      .update({[key]:value})
  }

  GetSectionListItem = item => {
    //Function for click on an item
    Alert.alert('item');
  };

  check = (item) => {
    // console.log('item', item)
    this.updateUser('accountType', item.value)
    // this.setState({sexualIdentity: item.value})
  }

  selectItem = (item) => {
    // console.log('item', item)
    const {lookingFor} = this.state.user
    let newLookingFor = lookingFor
    newLookingFor[item.value] = !lookingFor[item.value]
    this.updateUser('lookingFor', newLookingFor)
    // this.setState({sexualIdentity: item.value})
  }

  FlatListItemSeparator = () => {
    return (
      //Item Separator
      <View
        style={{ height: 0.5, width: '100%', backgroundColor: '#C8C8C8' }}
      />
    );
  };

  buildTickItem = (data) => {
    return(
      <TouchableOpacity
        style={{flexDirection:'row', alignItems:'center', flex:1}}
        onPress={() => this.check(data.item)}>
        <Text
          style={styles.SectionListItemStyle}
          //Item Separator View
          >
          {data.item.value}
        </Text>
        {this.state.user.accountType == data.item.value ?
          <Icon
            style={{ backgroundColor: 'transparent', paddingHorizontal:15}}
            name={'done'}
            size={24}
            color={'black'} /> : <View/>
        }
      </TouchableOpacity>
    )
  }

  buildMultiTickItem = (data) => {
    return(
      <TouchableOpacity
        style={{flexDirection:'row', alignItems:'center', flex:1}}
        onPress={() => this.selectItem(data.item)}>
        <Text
          style={styles.SectionListItemStyle}
          //Item Separator View
          >
          {data.item.value}
        </Text>
        {this.state.user.lookingFor[data.item.value] ?
          <Icon
            style={{ backgroundColor: 'transparent', paddingHorizontal:15}}
            name={'done'}
            size={24}
            color={'black'} /> : <View/>
        }
      </TouchableOpacity>
    )
  }

  buildEditItem = (data) => {
    // const {user} = this.state
    const isPartner = data.item.value == 'partnersName'
    const name = isPartner ? this.state.partnersName : this.state.name
    const nameType = data.item.value
    // console.log('data', data)
    return(
      <View
        style={{flexDirection:'row', alignItems:'center', flex:1}}
        onPress={() => this.check(data.item)}>
        <Text
          style={styles.SectionListItemStyle}
          //Item Separator View
          >
          {data.item.label}
        </Text>
        <TextInput
          style={{height: 40, width: 100, borderColor: 'transparent', fontSize: 15, paddingRight: 20, color: '#F15959'}}
          onChangeText={(text) => this.setState({[nameType]:text})}
          onSubmitEditing={isPartner ? () => this.updatePartner('name', name) : () => this.updateUser('name', name)}
          value={name}
        />
      </View>
    )
  }

  buildPickerItem = (data) => {
    const isPartner = data.item.value == 'partnersBirthday'
    const {user} = this.state
    const whichPicker = isPartner ? 'isDatePickerVisiblePartner' : 'isDatePickerVisible'
    const whichBirthday = isPartner ? user.partner.birthday : user.birthday

    return(
      <TouchableOpacity
        style={{flexDirection:'row', alignItems:'center', flex:1}}
        onPress={() => this.showDatePicker(whichPicker)}>
        <Text
          style={styles.SectionListItemStyle}>
          {data.item.label}
        </Text>
        <Text
          style={{paddingRight:20}}
          >
          {whichBirthday}
        </Text>
      </TouchableOpacity>
    )    
  }

  buildPickerModal = (data) => {
    const isPartner = data.item.value.indexOf('partner') > -1 ? true : false
    const modalType = data.item.label.toLowerCase()
    const {user} = this.state
    const whichResult = isPartner ? user.partner[modalType] : user[modalType]
    const orientation = [
      { key: '10', label: 'Straight' },
      { key: '11', label: 'Gay' },
      { key: '12', label: 'Bisexual' },
    ]
    const gender = [
      { key: '13', label: 'Male' },
      { key: '14', label: 'Female' },
    ]
    const dataType = modalType == 'gender' ? gender : orientation
    return(
        <ModalSelector
          ref={instance => this.dropDownPicker = instance} 
          data={dataType}
          touchableStyle={{flex:1, flexDirection:'row', backgroundColor:'transparent', alignItems:'center'}}
          childrenContainerStyle = {{flex:1, flexDirection:'row', alignItems:'center'}}
          onChange={isPartner ? (item) => this.updatePartner(modalType, item.label) : (item) => this.updateUser(modalType, item.label)}>
          <Text
            style={styles.SectionListItemStyle}>
            {data.item.label}
          </Text>
          <Text
            style={{paddingRight:20}}
            >
            {whichResult}
          </Text>

        </ModalSelector>
    )    
  }

  buildItem = (data) => {
    if (data.item.label == 'Name') {
      return this.buildEditItem(data)
    } else if (data.item.label == 'Birthday') {
      return this.buildPickerItem(data)
    } else if (data.item.label == 'Orientation') {
      return this.buildPickerModal(data)
    } else if (data.item.label == 'Gender') {
      return this.buildPickerModal(data)
    } else if (data.item.label == 'Looking') {
      return this.buildMultiTickItem(data)
    } else {
      return this.buildTickItem(data)
    }
  }

  render() {
    const {user, isDatePickerVisiblePartner, isDatePickerVisible} = this.state

    const whichBirthday = isDatePickerVisiblePartner ? user.partner.birthday : user.birthday
    return (
      <KeyboardAvoidingView style={{flex:1}} keyboardVerticalOffset={80} behavior="padding" enabled>
        <DateTimePicker
          date = {new Date(whichBirthday)}
          isVisible={isDatePickerVisiblePartner || isDatePickerVisible}
          onConfirm={this.handleDatePicked}
          onCancel={() => this.hideDatePicker(whichPicker)}
        />

      <View style={{ marginTop: Platform.OS == 'ios' ? 0 : 0 }}>
        <SectionList
          ItemSeparatorComponent={this.FlatListItemSeparator}
          sections={user.accountType.indexOf('&') > -1 ? sections : sections.slice(0, 3)}
          renderSectionHeader={({ section }) => (
            <Text style={styles.SectionHeaderStyle}> {section.title} </Text>
          )}
          renderItem={this.buildItem}
          keyExtractor={(item, index) => index}
        />

        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  SectionHeaderStyle: {
    backgroundColor: '#F15959',
    fontSize: 20,
    padding: 5,
    color: '#fff',
  },

  SectionListItemStyle: {
    flex:1,
    fontSize: 15,
    padding: 20,
    color: '#000',
    // backgroundColor: '#F5F5F5',
  },
});
