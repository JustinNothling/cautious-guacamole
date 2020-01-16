import { YellowBox } from 'react-native';
import _ from 'lodash';

YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

import { createSwitchNavigator, createBottomTabNavigator, createStackNavigator, createAppContainer } from 'react-navigation';
import React from 'react'
import {Ionicons, MaterialCommunityIcons} from 'react-native-vector-icons';

import * as firebase from 'firebase'
import config from '/config'
console.log('config', config)

import AuthLoading from './app/screens/authLoading'
import Home from './app/screens/home'
import Login from './app/screens/login'
import Profile from './app/screens/profile'
import Prefs from './app/screens/prefs'
import Photos from './app/screens/photos'
import Chat from './app/screens/chat'
import Matches from './app/screens/matches'



firebase.initializeApp(config)


const AuthStack = createStackNavigator({ Login: Login }, { headerMode:'none'});
const PrefStack = createStackNavigator(
  {
    Profile : Profile,
    Prefs: Prefs,
    Photos: Photos,
  }
);

const MatchStack = createStackNavigator(
  {
    Matches: Matches,
    Chat: Chat
  }
);

PrefStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  };
};

MatchStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;
  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  };
};

const AppStack = createBottomTabNavigator(
  {
    Profile: PrefStack,
    Home: Home,
    Matches: MatchStack
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        switch(routeName) {
          case "Home":
            return <MaterialCommunityIcons name={'numeric-3'} size={45} color={tintColor} />
            break;
          case "Matches":
            return <Ionicons name={'ios-chatbubbles'} size={25} color={tintColor} />
            break;
          case "Profile":
            return <Ionicons name={'md-person'} size={25} color={tintColor} />
            break;
        }
      },
    }),
    tabBarOptions: {
      activeTintColor: '#F15959',
      inactiveTintColor: 'lightgray',
      showLabel: false,
    },
  },
  {
    headerMode:'none'
  }
)

export default createAppContainer(createSwitchNavigator(
  {
    AuthLoading: AuthLoading,
    App: AppStack,
    Auth: AuthStack,
    Pref: PrefStack
  },
  {
    initialRouteName: 'AuthLoading',
  }
));