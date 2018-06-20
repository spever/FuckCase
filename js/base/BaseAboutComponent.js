'use strict';

import React,{Component} from 'react';
import {
  StyleSheet,
  Image,
  View,
  Dimensions,
  Text,
  Platform
} from 'react-native';

import ParallaxScrollView from 'react-native-parallax-scroll-view'
import FavoriteDao from "../dao/FavoriteDao";
import {FLAG_STORAGE} from "../dao/RepositoryDao";
import FavoriteUtils from "../util/FavoriteUtils";
import RepositoryUtils from "../util/RepositoryUtils";
import ViewUtils from "../util/ViewUtils";
import RepositoryCell from "../common/RepositoryCell";
import ActionUtils from "../util/ActionUtils";
import RepositoryDetailPage from "../common/RepositoryDetailPage";


export var FLAG_ABOUT = {flag_about:'about',flag_about_me:'flag_about_me'};


export default class BaseAboutComponent {

  constructor(props,flag_about,updateState,config) {
    this.props = props;
    this.flag_about = flag_about;
    this.updateState = updateState;
    this.config = config;
    this.repositories = [];
    this.favoriteKeys = null;
    this.favoriteDao =  new FavoriteDao(FLAG_STORAGE.flag_popular);
    this.repositoryUtil = new RepositoryUtils(this);


  }


  componentDidMount() {
    if (this.flag_about === FLAG_ABOUT.flag_about){
        this.repositoryUtil.fetchRepository(this.config.info.currentRepoUrl)

    }else if (this.flag_about === FLAG_ABOUT.flag_about_me){
        var urls = [];
        var items = this.config.items;
        for (var i=0,l=items.length;i<l;i++){
            urls.push(this.config.info.url+items[i]);

        }

        this.repositoryUtil.fetchRepositorys(urls)
    }
  }


  onNotifyDataChanged(items){
    this.updateFavorite(items);

  }

  async updateFavorite(repositories){

    if (repositories) this.repositories = repositories;
    if (!this.repositories) return;
    if (!this.favoriteKeys){
        this.favoriteKeys = await this.favoriteDao.getFavoriteKeys();

    }

    let projectModels = [];
    for (var i=0,len=this.repositories.length;i<len;i++){

        var data = this.repositories[i];
        var item = data.item ? data.item : data;
        projectModels.push({
          isFavorite:FavoriteUtils.checkFavorite(this.repositories[i],this.favoriteKeys?this.favoriteKeys:null),
          item:item,
        });

    }

    this.updateState({
      projectModels:projectModels,
    });


  }

  onFavorite(item,isFavorite){
    if (isFavorite){
      this.favoriteDao.saveFavoriteItem(item.id.toString(),JSON.stringify(item));
    }else {
      this.favoriteDao.removeFavoriteItem(item.id.toString());
    }

  }

  onSelectRepository(projectModel){
    this.props.navigator.push({
      title:projectModel.item.full_name,
      component:RepositoryDetailPage,
      params:{
        projectModel:projectModel,
        flag:FLAG_STORAGE.flag_popular,
          ...this.props
      }
    })

  }

  renderRepository(projectModels){
    if (!projectModels || projectModels.length ===0){
        return null;

    }

    let views = [];
    for (let i=0,l=projectModels.length;i<l;i++){
        let projectModel = projectModels[i];
        views.push(
          <RepositoryCell
              theme={this.props.theme}
              key={projectModel.item.id}
              projectModel={projectModel}
              onSelect={() => this.onSelectRepository(projectModel)}
              onFavorite={(item,isFavorite) => ActionUtils.onFavorite(this.favoriteDao,item,isFavorite,FLAG_STORAGE.flag_popular)}
          />
        );

    }

    return views;

  }


  createParallaxRenderConfig(params) {
    let config = {};
    config.renderBackground = () => (
      <View>
        <Image source={{uri:params.backgroundImage,
          width:window.width,
          height:PARALLAX_HEADER_HEIGHT}}/>
        <View style={{position:'absolute',
          top:0,
          width:window.width,
          height:PARALLAX_HEADER_HEIGHT,
          backgroundColor:'rgba(0,0,0,.4)'

        }}/>
      </View>

    );


    config.renderForeground = () => (
        <View key='parallax-header' style={styles.parallaxHeader}>
          <Image style={styles.avatar} source={{
            uri:params.avatar,
            width:AVATAR_SIZE,
            height:AVATAR_SIZE}}
          />
          <Text style={styles.sectionSpeakerText}>
            {params.name}
          </Text>
          <Text style={styles.sectionTitleText}>
            {params.description}
          </Text>
        </View>
    );


    config.renderStickyHeader = () => (
        <View key='sticky-header' style={styles.stickySection}>
          <Text style={styles.stickySectionText}>{params.name}</Text>
        </View>
    );


    config.renderFixedHeader = () => (
        <View key='fixed-header' style={styles.fixedSection}>
          {ViewUtils.getLeftButton(() => this.props.navigator.pop())}
        </View>
    );

    return config;


  }


  render(contentView,params) {

    let config = this.createParallaxRenderConfig(params);
    return (
        <ParallaxScrollView
            backgroundColor={this.props.theme.themeColor}
            headerBackgroundColor='#333'
            stickyHeaderHeight={STICKY_HEADER_HEIGHT}
            parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
            backgroundScrollSpeed={10}
            {...config}
        >
          {contentView}
        </ParallaxScrollView>
    );
  }


}

const window = Dimensions.get("window");

const AVATAR_SIZE = 120;
const ROW_HEIGHT = 60;
const PARALLAX_HEADER_HEIGHT = 350;
const STICKY_HEADER_HEIGHT = 70;

const styles = StyleSheet.create({
  parallaxHeader:{
    flex:1,
    flexDirection:'column',
    alignItems:'center',
    paddingTop:100


  },

  avatar:{
    marginBottom:10,
    borderRadius:AVATAR_SIZE/2

  },

  sectionSpeakerText:{
    color:'white',
    fontSize:24,
    paddingVertical:5

  },

  sectionTitleText:{
    color:'white',
    fontSize:18,
    paddingVertical:5

  },

  stickySection:{
    height:STICKY_HEADER_HEIGHT,
    justifyContent:'center',
    alignItems:'center',
    paddingTop:Platform.OS === 'ios' ? 20 : 0,

  },

  stickySectionText:{
    color:'white',
    fontSize:20,
    margin:10

  },

  fixedSection:{
    position:'absolute',
    bottom:0,
    left:0,
    right:0,
    top:0,
    flexDirection:'row',
    alignItems:'center',
    paddingTop:Platform.OS === 'ios' ? 20 : 0,
    justifyContent:'space-between'

  }

});