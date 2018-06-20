'use strict';
import React,{Component} from 'react';
import {
  StyleSheet,
  View,
  WebView
} from 'react-native';
import NavigationBar from "./NavigationBar";
import ViewUtils from "../util/ViewUtils";

const WEBVIEW_REF='webview';

export default class WebViewPage extends Component{

  constructor(props) {
    super(props);
    this.state = {
      url:this.props.url,
      canGoBack:false,
      title:this.props.title,
      theme:this.props.theme
    }
  }


  onBackPress(){
    if (this.state.canGoBack){
      this.refs[WEBVIEW_REF].goBack();
    }else {
      this.props.navigator.pop();
    }

  }


  onNavigationStateChange(navState){
    this.setState({
      canGoBack:navState.canGoBack,
      url:navState.url,
    })

  }


  render() {
    return (
        <View style={styles.container}>
          <NavigationBar
              title={this.state.title}
              navigator={this.props.navigator}
              style={this.state.theme.styles.navBar}
              popEnabled={false}
              leftButton={ViewUtils.getLeftButton(() => this.onBackPress())}
          />
          <WebView
              ref={WEBVIEW_REF}
              startInLoadingState={true}
              onNavigationStateChange={(e) => this.onNavigationStateChange(e)}
              source={{uri:this.props.url}}
          />

        </View>
    );
  }


}


const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'white'
  }
})