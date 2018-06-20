'use strict';
import React,{Component} from 'react';
import {
  StyleSheet,
  View,
  Linking,
  Clipboard
} from 'react-native';
import BaseAboutComponent, {FLAG_ABOUT} from "../../base/BaseAboutComponent";
import Config from '../../../res/data/Config'
import Toast from 'react-native-easy-toast';
import ViewUtils from "../../util/ViewUtils";
import GlobalStyle from '../../../res/styles/GlobalStyles';
import WebViewPage from "../../common/WebViewPage";

const FLAG = {
  REPOSITORY:'开源项目',
  BLOG:{
    name:'技术博客',
    items:{
      PERSONAL_BLOG:{
        title:'个人博客',
        url:'http://jiapenghui.com'

      },
      CSDN:{
        title: 'CSDN',
        url: 'http://blog.csdn.net/fengyuzhengfan',

      },
      JIANSHU:{
        title: '简书',
        url: 'http://www.jianshu.com/users/ca3943a4172a/latest_articles',

      },
      GITHUB:{
        title: 'GitHub',
        url: 'https://github.com/crazycodeboy',

      },
    }

  },
  CONTACT:{
    name:'联系方式',
    items:{
      QQ:{
        title:'QQ',
        account:'1586866509',

      },
      EMAIL:{
        title:'Email',
        account:'crazycodeboy@gmail.com',

      }
    }

  },
  QQ:{
    name:'技术交流群',
    items:{
      MD:{
        title: '移动开发者技术分享群',
        account: '335939197',

      },
      RN:{
        title: 'React Native学习交流群',
        account: '165774887',

      }
    }

  }
}

export default class AboutMePage extends Component{

  constructor(props) {
    super(props);
    this.aboutComponent = new BaseAboutComponent(props,FLAG_ABOUT.flag_about_me,(dic => this.updateState(dic)),Config)
    this.state = {
      projectModels:[],
      author:Config.author,
      showRepository:false,
      showBlog:false,
      showQQ:false,
      showContact:false,

    }
  }


  componentDidMount() {
    this.aboutComponent.componentDidMount();
  }


  updateState(dic){
    this.setState(dic)
  }


  onClick(tab){
    let TargetComponent,params = {...this.props,menuType:tab};
    switch (tab){

      case FLAG.BLOG:
           this.updateState({showBlog:!this.state.showBlog});
           break;
      case FLAG.REPOSITORY:
           this.updateState({showRepository:!this.state.showRepository});
           break;

      case FLAG.QQ:
           this.updateState({showQQ:!this.state.showQQ});
           break;

      case FLAG.CONTACT:
           this.updateState({showContact:!this.state.showContact});
           break;

      case FLAG.CONTACT.items.QQ:
           Clipboard.setString(tab.account);
           this.toast.show('QQ:'+tab.account+'已复制到剪贴板');
           break;

      case FLAG.CONTACT.items.EMAIL:
           var url = 'mailto:'+tab.account;
           Linking.canOpenURL(url).then(supported => {
             if (!supported){
               console.log('Can not handle url:'+url);
               alert('Can not handle url:'+url);
             }else {
               return Linking.openURL(url);
             }
           });

           break;

      case FLAG.QQ.items.MD:
      case FLAG.QQ.items.RN:
           Clipboard.setString(tab.account);
           this.toast.show('群号：'+tab.account+'已复制到剪贴板');
           break;

      case FLAG.BLOG.items.GITHUB:
      case FLAG.BLOG.items.CSDN:
      case FLAG.BLOG.items.JIANSHU:
      case FLAG.BLOG.items.PERSONAL_BLOG:
           TargetComponent = WebViewPage;
           params.url = tab.url;
           params.title = tab.title;
           break;


    }


    if (TargetComponent){
      this.props.navigator.push({
        component:TargetComponent,
        params:params,
      })

    }

  }


  getClickIcon(isShow){
    return isShow?require('../../../res/images/ic_tiaozhuan_up.png'):require('../../../res/images/ic_tiaozhuan_down.png');

  }


  renderItem(dict,isShowAccount){
    if (!dict) return null;
    let views=[];
    for (let i in dict){
      let title = isShowAccount ? dict[i].title + ':'+dict[i].account:dict[i].title;
      views.push(
          <View key={i}>
            {ViewUtils.createSettingItem(() => this.onClick(dict[i]),'',title,this.props.theme.styles.tabBarSelectedIcon)}
            <View style={GlobalStyle.cellBottomLineStyle}/>
          </View>
      )

    }

    return views;

  }

  render() {
    let contentView = <View>
      {ViewUtils.createSettingItem(() => this.onClick(FLAG.BLOG),require('../../../res/images/ic_computer.png'),FLAG.BLOG.name,this.props.theme.styles.tabBarSelectedIcon,this.getClickIcon(this.state.showBlog))}
      <View style={GlobalStyle.cellBottomLineStyle}/>
      {this.state.showBlog?this.renderItem(FLAG.BLOG.items,false):null}

      {ViewUtils.createSettingItem(() => this.onClick(FLAG.REPOSITORY),require('../../../res/images/ic_code.png'),FLAG.REPOSITORY,this.props.theme.styles.tabBarSelectedIcon,this.getClickIcon(this.state.showRepository))}
      <View style={styles.cellBottomLineStyle}/>
      {this.state.showRepository?this.aboutComponent.renderRepository(this.state.projectModels):null}

      {ViewUtils.createSettingItem(() => this.onClick(FLAG.QQ),require('../../../res/images/ic_computer.png'),FLAG.QQ.name,this.props.theme.styles.tabBarSelectedIcon,this.getClickIcon(this.state.showQQ))}
      <View style={GlobalStyle.cellBottomLineStyle}/>
      {this.state.showQQ?this.renderItem(FLAG.QQ.items,true):null}

      <View style={GlobalStyle.cellBottomLineStyle}/>
      {ViewUtils.createSettingItem(() => this.onClick(FLAG.CONTACT),require('../../../res/images/ic_contacts.png'),FLAG.CONTACT.name,this.props.theme.styles.tabBarSelectedIcon,this.getClickIcon(this.state.showContact))}
      <View style={GlobalStyle.cellBottomLineStyle}/>
      {this.state.showContact?this.renderItem(FLAG.CONTACT.items,true):null}

    </View>

    return (<View style={styles.container}>
      {this.aboutComponent.render(contentView,this.state.author)}
      <Toast ref={e=>this.toast = e}/>
    </View>);
  }


}


const styles = StyleSheet.create({
  container:{
    flex:1,
  }
})