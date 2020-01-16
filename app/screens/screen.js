import firebase from 'firebase'
import React, {Component} from 'react'
import { StyleSheet, Text, View } from 'react-native';
import SimpleScroller from '../components/simpleScroller'

export default class Screen extends Component {
  render() {
    return (
      <View style={{...styles.container, backgroundColor:this.props.backgroundColor}}>
        <Text>Screen</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});