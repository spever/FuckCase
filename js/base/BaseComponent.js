import React, {Component} from 'react';
import {
  DeviceEventEmitter
} from 'react-native';
import {ACTION_HOME} from "../pages/Entry/HomePage";

export default class BaseComponent extends Component {

  constructor(props) {
    super(props);
    this.state={
      theme:this.props.theme
    }
  }


  componentDidMount() {
    this.baseListener = DeviceEventEmitter.addListener('ACTION_BASE',(action,params) => this.changeThemeAction(action,params));
  }


  componentWillUnmount() {
    if (this.baseListener){
      this.baseListener.remove();
    }
  }

  changeThemeAction(action, params) {
    if (action === ACTION_HOME.A_THEME){
      this.onThemeChange(params);
    }

  }

  onThemeChange(theme) {
    if (!theme) return;
    this.setState({
      theme:theme
    })
  }
}

