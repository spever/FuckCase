import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ListView,
  DeviceEventEmitter,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import BaseComponent from "../../base/BaseComponent";
import LanguageDao, {FLAG_LANGUAGE} from "../../dao/LanguageDao";
import ScrollableTableView, {ScrollableTabBar} from 'react-native-scrollable-tab-view';
import RepositoryData, {FLAG_STORAGE} from "../../dao/RepositoryDao";
import FavoriteDao from "../../dao/FavoriteDao";
import TimeUtils from "../../util/TimeUtils";
import ProjectModel from "../../model/ProjectModel";
import FavoriteUtils from "../../util/FavoriteUtils";
import RepositoryDetailPage from "../../common/RepositoryDetailPage";
import RepositoryCell from "../../common/RepositoryCell";
import ActionUtils from "../../util/ActionUtils";
import NavigationBar from "../../common/NavigationBar";
import SearchPage from "./SearchPage";
import {FLAG_TAB} from "../Entry/HomePage";
import MoreMenu, {MORE_MENU} from "../../common/MoreMenu";
import ViewUtils from "../../util/ViewUtils";
import CustomThemePage from "../Mine/CustomThemePage";


const URL = 'https://api.github.com/search/repositories?q=';
const QUERY_STR = '&sort=starts';

var favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_popular);

export default class PopularPage extends BaseComponent {
  constructor(props) {
    super(props);

    this.languageDao=new LanguageDao(FLAG_LANGUAGE.flag_key);
    this.state={
      languages:[],
      customThemeVisible:false,
      theme:this.props.theme
    }

    this.loadData();
  }

  loadData() {
    this.languageDao.fetch().then(result => {
      this.setState({
        languages:result
      })
    }).catch(error => {
      console.log(error);
    });
  }




  render() {
    let content = this.state.languages.length>0?
        <ScrollableTableView
        tabBarBackgroundColor={this.state.theme.themeColor}
        tabBarInactiveTextColor='mintcream'
        tabBarActiveTextColor='white'
        tabBarUnderlineStyle={{backgroundColor:'#e7e7e7',height:2}}
        renderTabBar={() => <ScrollableTabBar/>}
        >

          {this.state.languages.map((result,i,arr) =>{
            let item = arr[i];
            return item.checked ? <PopularTabPage key={i} tabLabel = {item.name} flag = {FLAG_STORAGE.flag_popular} {...this.props} />:null;
          })}

        </ScrollableTableView>:null;

    return (
        <View style={styles.container}>
          <NavigationBar
              title={'最热标签'}
              style={this.state.theme.styles.navBar}
              statusBar={{backgroundColor:this.state.theme.themeColor}}
              rightButton={this.renderNavRightButton()}
          />
          {content}
          {this.renderMoreView()}
          {this.renderCustomTheme()}

        </View>
    );
  }

  renderNavRightButton() {
    return (
        <View style={{flexDirection:'row'}}>
          <TouchableOpacity
              onPress={() => {
                this.props.navigator.push({
                  component:SearchPage,
                  params:{
                    theme:this.state.theme,
                    ...this.props,
                  }
                })
              }}
          >
            <View>
              <Image
                style={{width:24,height:24,marginRight:10,marginTop:10}}
                source={require('../../../res/images/ic_search_white_48pt.png')}
              />
            </View>

          </TouchableOpacity>
          {ViewUtils.createMoreButton(() =>{this.refs.moreMenu.open()})}
        </View>
    );

  }

  renderMoreView() {

    let params = {...this.props,fromPage:FLAG_TAB.flag_popularTab};
    return <MoreMenu
        ref = "moreMenu"
        {...params}
        menus={[MORE_MENU.Custom_Key,MORE_MENU.Sort_Key,MORE_MENU.Remove_Key,MORE_MENU.Custom_Theme]}
        anchorView={this.refs.moreMenuButton}
        onMoreMenuSelect={e => {
          if ( e === MORE_MENU.Custom_Theme){
            this.setState({
              customThemeVisible:true,
            })
          }
          }
        }
    />;

  }

  renderCustomTheme() {
    return (<CustomThemePage
            visible={this.state.customThemeVisible}
            {...this.props}
            onClose={() => this.setState({customThemeVisible:false})}

        />

    );
  }
}


class PopularTabPage extends Component{

  constructor(props) {
    super(props);
    this.isFavoriteChanged = false;
    this.dataRespository = new RepositoryData(FLAG_STORAGE.flag_popular);
    this.state={
      dataSource:new ListView.DataSource({rowHasChanged:(r1,r2) => r1!==r2}),
      isLoading:false,
      favoriteKeys:[],
      theme:this.props.theme
    }

  }


  componentDidMount() {

    this.loadData(true);
    console.disableYellowBox = true;
    this.listener = DeviceEventEmitter.addListener('favoriteChanged_popular',() =>{
      this.isFavoriteChanged = true;
    })

  }


  componentWillReceiveProps(nextProps) {

    if (this.isFavoriteChanged){
      this.getFavoriteKeys1();
      this.isFavoriteChanged = false

    }else if (nextProps !==this.state.theme){
      this.updateState({theme:nextProps.theme});
      this.getFavoriteKeys1()

    }else {

    }

  }


  componentWillUnmount() {
    if (this.listener){
          this.listener.remove();
    }

  }


  loadData(shouldShowLoading){

    if (shouldShowLoading){
      this.setState({
        isLoading:true
      })
    }

    //请求url地址
    let url = URL + this.props.tabLabel + QUERY_STR;

    this.dataRespository.fetchRepository(url)

        .then((result) => {
          this.items = result&&result.items ? result.items:result?result:[];
          this.getFavoriteKeys1();
          if (result && result.update_date && !TimeUtils.checkDate(result.update_date)){
            return this.dataRespository.fetchNetRepository(url);
          }

        })
        .then((items) => {
          if (!items || items.length === 0) return;
          this.items = items;
          this.getFavoriteKeys1();

        })
        .catch(error =>{
          console.log(error);
          this.updateState({
            isLoading:false
          });
        })
  }

  renderRow(projectModel){
    return <RepositoryCell
        key = {projectModel.item.id}
        theme = {this.state.theme}
        projectModel = {projectModel}
        onSelect = {() => this.onSelectRepository(projectModel)}
        onFavorite = {(item,isFavorite) => this.onFavorite(item,isFavorite)}/>

  }

  onFavorite(item,isFavorite){
    ActionUtils.onFavorite(favoriteDao,item,isFavorite,this.props.flag)

  }

  //点击cell跳转
  onSelectRepository(projectModel){
    this.props.navigator.push({
      title:projectModel.item.full_name,
      component:RepositoryDetailPage,
      params:{
        projectModel:projectModel,
        ...this.props
      }
    });


  }


  render() {
    return (
        <View style={{flex:1}}>
          <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={(data) => this.renderRow(data)}
          refreshControl={
            <RefreshControl
                refreshing={this.state.isLoading}
                onRefresh={() => this.loadData()}
                colors={[this.state.theme.themeColor]}
                tintColor={this.state.theme.themeColor}
                titleColor={this.state.theme.themeColor}
                title={'Loading'}
            />}
          />

        </View>
    );
  }


  //更新里的items的收藏的状态并刷新列表
  flushFavoriteState(){
    let projectModels =[];
    let items = this.items;

    if (!items) return;

    for (var i=0,len =items.length; i<len; i++){

      projectModels.push(new ProjectModel(items[i],FavoriteUtils.checkFavorite(items[i],this.state.favoriteKeys)))

    }

    this.updateState({
      isLoading:false,
      dataSource:this.getDataSource(projectModels)
    })
  }

  getDataSource(projectModels){

    return this.state.dataSource.cloneWithRows(projectModels);

  }

  getFavoriteKeys1() {
    favoriteDao.getFavoriteKeys()
        .then(keys => {
          if (keys){
            //更新当前保存的所有收藏项目的key的集合
            this.updateState({favoriteKeys:keys})
          }
          this.flushFavoriteState();
        })
        .catch(e => {
          console.log(e);
          this.flushFavoriteState();
        })
  }


  updateState(dict) {
    if (!this) return;
    this.setState(dict)

  }
}


const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'white'
  },

  tips:{
    color:'black'
  }
})
