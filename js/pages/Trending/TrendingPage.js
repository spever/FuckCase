import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ListView,
  RefreshControl,
  DeviceEventEmitter,
  TouchableOpacity,
} from 'react-native';

import BaseComponent from "../../base/BaseComponent";
import LanguageDao, {FLAG_LANGUAGE} from "../../dao/LanguageDao";
import TimeSpan from "../../model/TimeSpan";
import ViewUtils from "../../util/ViewUtils";
import MoreMenu, {MORE_MENU} from "../../common/MoreMenu";
import {FLAG_TAB} from "../Entry/HomePage";
import ScrollableTabView, {ScrollableTabBar} from "react-native-scrollable-tab-view";
import Popover from "../../common/Popover";
import NavigationBar from "../../common/NavigationBar";
import TrendingCell from "../../common/TrendingCell";
import ActionUtils from "../../util/ActionUtils";
import FavoriteDao from "../../dao/FavoriteDao";
import {FLAG_STORAGE} from "../../dao/RepositoryDao";
import RepositoryDao from "../../dao/RepositoryDao";
import TimeUtils from "../../util/TimeUtils";
import ProjectModel from "../../model/ProjectModel";
import FavoriteUtils from "../../util/FavoriteUtils";
import RepositoryDetailPage from "../../common/RepositoryDetailPage";
import CustomThemePage from "../Mine/CustomThemePage";

var timeSpanTextArr = [
    new TimeSpan('今 天','since=daily'),
    new TimeSpan('本 周','since=weekly'),
    new TimeSpan('本 月','since=monthly')
];

const API_URL = 'https://github.com/trending/'

var favoriteDao = new FavoriteDao(FLAG_STORAGE.flag_trending)
var dataRepository = new RepositoryDao(FLAG_STORAGE.flag_trending)

export default class TrendingPage extends BaseComponent {

  constructor(props) {
    super(props);
    this.languageDao = new LanguageDao(FLAG_LANGUAGE.flag_language);
    this.state={
      isVisible:false,
      buttonRect:[],
      timeSpan:timeSpanTextArr[0],
      languages:[],
      theme:this.props.theme
    }
    this.loadData();
  }

  loadData(){
    this.languageDao.fetch()
        .then(result => {
          this.setState({
            languages:result
          })
        })
        .catch(error => {
          console.log(error);
        });


  }

  renderTitleView(){
    return <View>
      <TouchableOpacity
          ref='button'
          onPress={() => this.showPopover()}
      >
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Text style={{fontSize:18,color:'white',fontWeight:'400'}}>语言趋势 {this.state.timeSpan.showText}</Text>
          <Image
            style={{width:14,height:14,marginLeft:6}}
            source={require('../../../res/images/ic_spinner_triangle.png')}
          />
        </View>


      </TouchableOpacity>
    </View>
  }

  renderNavRightButton(){
    return <View style={{flexDirection:'row'}}>
    {ViewUtils.createMoreButton(() => this.refs.moreMenu.open())}
    </View>
  }

  renderMoreView(){
    let params = {...this.props,fromPage:FLAG_TAB.flag_popularTab};
    return <MoreMenu
        ref='moreMenu'
        {...params}
        menus={[MORE_MENU.Custom_language,MORE_MENU.Sort_language,MORE_MENU.Custom_Theme]}
        anchorView={this.refs.moreMenuButton}
        onMoreMenuSelect={e => {
          if (e === MORE_MENU.Custom_Theme){
              this.setState({
                customThemeVisible:true
              })
          }

          }
        }
    />
}
  showPopover(){
    this.refs.button.measure((ox,oy,width,height,px,py) => {
      this.setState({
        isVisible:true,
        buttonRect:{x:px,y:py,width:width,height:height}
      })
    });
  }

  closePopover(){
    this.setState({
      isVisible:false,
    })
  }


  onSelectTimeSpan(timeSpan){
    this.setState({
      timeSpan:timeSpan,
      isVisible:false,
    })
  }

  renderCustomTheme(){
    return (<CustomThemePage
            visible={this.state.customThemeVisible}
            {...this.props}
            onClose={() => this.setState({customThemeVisible:false})}

        />

    );

  }


  render() {

    let content = this.state.languages.length>0?
        <ScrollableTabView
            tabBarBackgroundColor={this.state.theme.themeColor}
            tabBarActiveTextColor='white'
            tabBarInactiveTextColor='mintcream'
            tabBarUnderlineStyle={{backgroundColor:'#e7e7e7',height:2}}
            renderTabBar={() => <ScrollableTabBar/>}
        >
          {this.state.languages.map((result,i,arr) => {
            let item = arr[i];
            return item.checked?<TrendingTabPage key={i} tabLabel={item.name} timeSpan={this.state.timeSpan} {...this.props} />:null;
          })}

        </ScrollableTabView>:null;

     let timeSpanView=
         <Popover
             isVisible={this.state.isVisible}
             fromRect={this.state.buttonRect}
             placement='bottom'
             onClose={() => this.closePopover()}
             contentStyle={{backgroundColor:'#343434',opacity:0.82}}
         >
           {timeSpanTextArr.map((result,i,arr) => {
             return <TouchableOpacity
                 key={i}
                 underlayColor='transparent={}'
                 onPress={() => this.onSelectTimeSpan(arr[i])}
             >
               <View>
                 <Text style={{fontSize:15,color:'white',fontWeight:'400',paddingTop:2,paddingLeft:6,paddingRight:6}}>
                   {arr[i].showText}
                 </Text>
               </View>

             </TouchableOpacity>
           })}

         </Popover>


    return (
        <View style={styles.container}>
          <NavigationBar
              titleView={this.renderTitleView()}
              style={this.state.theme.styles.navBar}
              statusBar={{backgroundColor:this.state.theme.themeColor}}
              rightButton={this.renderNavRightButton()}
          />
          {content}
          {timeSpanView}
          {this.renderMoreView()}
          {this.renderCustomTheme()}
        </View>
    );
  }
}


class TrendingTabPage extends Component{

  constructor(props) {
    super(props);
    this.state={
      dataSource:new ListView.DataSource({rowHasChanged:((r1, r2) => r1!==r2)}),
      isLoading:false,
      favoriteKeys:[]
    }
  }


  componentDidMount() {
    this.loadData(this.props.timeSpan,true);
    this.listener=DeviceEventEmitter.addListener('favoriteChanged_trending',()=>{
      this.isFavoriteChanged = true;
    })
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.timeSpan !== this.props.timeSpan){

      this.loadData(nextProps.timeSpan);
    }else if (this.isFavoriteChanged){

      this.isFavoriteChanged = false;
      this.getFavoriteKeys();
    }else if (nextProps !==this.state.theme){

      this.updateState({theme:nextProps.theme});
      this.getFavoriteKeys();
    }else {


    }
  }


  componentWillUnmount() {
    if (this.listener){
          this.listener.remove();
    }
  }


  getFetchUrl(timeSpan,category){
    return API_URL +category + '?' +timeSpan.searchText;

  }


  loadData(timeSpan,isRefresh){

    this.updateState({
      isLoading:true
    })

    let url = this.getFetchUrl(timeSpan,this.props.tabLabel);

    dataRepository.fetchRepository(url)
        .then((result) => {
          this.items = result && result.items? result.items:result?result:[];
          this.getFavoriteKeys();
          if (!this.items && result && result.update_date && !TimeUtils.checkDate(result.update_date)){
            return dataRepository.fetchNetRepository(url);

          }
        })
        .then(items => {
          if (!items || items.length ===0) return;
          this.items = items;
          this.getFavoriteKeys();
        })
        .catch(error => {
          console.log(error);
          this.setState({
            isLoading:false
          })
        })





  }

  flushFavoriteState(){
    let projectModels = [];
    let items = this.items;

    if (!items) {
      return;
    }

    for (var i=0,len= items.length;i<len;i++){
      projectModels.push(new ProjectModel(items[i],FavoriteUtils.checkFavorite(items[i],this.state.favoriteKeys)))

    }

    this.updateState({
      isLoading:false,
      dataSource:this.getDataSource(projectModels)
    })
  }


  getDataSource(items){
    return this.state.dataSource.cloneWithRows(items);

  }

  getFavoriteKeys(){

    favoriteDao.getFavoriteKeys()
        .then(keys => {
          if (keys){
            this.updateState({favoriteKeys:keys})
          }

          this.flushFavoriteState();
        })

  }

  updateState(dict){
    if (!this) return;
    this.setState(dict);

  }


  onSelectRepository(projectModel){
    var item = projectModel.item;
    this.props.navigator.push({
      title:item.fullName,
      component:RepositoryDetailPage,
      params:{
        projectModel:projectModel,
        parentComponent:this,
        flag:FLAG_STORAGE.flag_trending,
        ...this.props
      }

    })

  }

  renderRow(projectModel){

    return <TrendingCell
        key={projectModel.item.fullName}
        onSelect={() => this.onSelectRepository(projectModel)}
        projectModel={projectModel}
        theme={this.props.theme}
        onFavorite={(item,isFavorite) => ActionUtils.onFavorite(favoriteDao,item,isFavorite,FLAG_STORAGE.flag_trending)}
    />


  }

  onRefresh(){
    this.loadData(this.props.timeSpan)

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
                    onRefresh={() => this.onRefresh()}
                    colors={[this.props.theme.themeColor]}
                    tintColor={this.props.theme.themeColor}
                    titleColor={this.props.theme.themeColor}
                    title={'Loading'}
                />
              }


          />

        </View>
    );
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
});
