import React,{Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  DeviceEventEmitter,
  ListView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';

import FavoriteDao from "../../dao/FavoriteDao";
import {FLAG_STORAGE} from "../../dao/RepositoryDao";
import LanguageDao, {FLAG_LANGUAGE} from "../../dao/LanguageDao";
import {ACTION_HOME, FLAG_TAB} from "../Entry/HomePage";
import Toast, {DURATION} from 'react-native-easy-toast';
import ViewUtils from "../../util/ViewUtils";
import GlobalStyles from '../../../res/styles/GlobalStyles';
import ProjectModel from "../../model/ProjectModel";
import FavoriteUtils from "../../util/FavoriteUtils";
import RequestUtils from "../../util/RequestUtils";
import RepositoryCell from "../../common/RepositoryCell";
import ActionUtils from "../../util/ActionUtils";
import RepositoryDetailPage from "../../common/RepositoryDetailPage";


const API_URL = 'https://api.github.com/search/repositories?q=';
const QUERY_STR = '&sort=starts';


export default class SearchPage extends Component{

  constructor(props) {
    super(props);
    this.favoriteDao1 = new FavoriteDao(FLAG_STORAGE.flag_popular);
    this.languangeDao = new LanguageDao(FLAG_LANGUAGE.flag_key);
    this.isKeyChanged = false;
    this.state = {
      theme:this.props.theme,
      favoriteKeys:[],
      isLoading:false,
      rightButtonText:'搜索',
      dataSource:new ListView.DataSource({rowHasChanged:(r1, r2) => r1!==r2})
    }
  }


  componentDidMount() {
    //读取所有标签
    this.initKeys();
  }


  componentWillUnmount() {
    if (this.isKeyChanged){
      DeviceEventEmitter.emit('ACTION_HOME',ACTION_HOME.A_RESTART,FLAG_TAB.flag_popularTab);

    }

    this.cancelRequest && this.cancelRequest.cancel();
  }


  async initKeys(){
    this.keys = await this.languangeDao.fetch();

  }

  checkKeyIsExist(keys,key) {
    for (let i = 0, l = keys.length; i < l; i++) {
      if (key.toLowerCase() === keys[i].name.toLowerCase()) return;

    }

    return false;
  }


  onRightButtonClick(){
    if (this.state.rightButtonText === '搜索'){
      this.updateState({rightButtonText:'取消'});
      this.loadData();

    }else if (this.state.rightButtonText === '取消'){
      this.updateState({
        rightButtonText:'搜索',
        isLoading:false,
      })

      this.cancelRequest.cancel();


    }
  }


  onBackPress(){
    this.refs.input.blur();
    this.props.navigator.pop();
  }


    updateState(dic){
    if (!this) return;
    this.setState(dic);

    }


  loadData(){
    this.updateState({
      isLoading:true,
      showBottomButton:false,
    });


    this.cancelRequest =RequestUtils(fetch(this.getFetchUrl(this.inputKey)));
    this.cancelRequest.promise
        .then(response => response.json())
        .then(responseData => {
          if (!this || responseData || !responseData.items ||responseData.items.length ===0){
            this.toast.show(this.inputKey+'什么都没找到',DURATION.LENGTH_SHORT);
            this.updateState({isLoading:false,rightButtonText:'搜索'});

          }
          this.items = responseData.items;
          this.getFavoriteKeys();
          if (!this.checkKeyIsExist(this.keys,this.inputKey)){
               this.updateState({showBottomButton:true})


          }
        })
        .catch(e =>{
          this.updateState({
            isLoading:false,
            rightButtonText:'搜索',
          })
        })



  }

  saveKey(){

    let key = this.inputKey;
    if (this.checkKeyIsExist(this.keys,key)){

      this.toast.show(key+'已经存在',DURATION.LENGTH_SHORT);

    }else {

      key={
        'path':key,
        'name':key,
        'checked':true,
      };
      this.keys.unshift(key);
      this.languangeDao.save(this.keys);
      this.isKeyChanged = true;
      this.toast.show(key.name + '保存成功',DURATION.LENGTH_LONG);

    }

  }

  getFetchUrl(key){
      return API_URL + key + QUERY_STR;

    }

  getFavoriteKeys(){

    this.favoriteDao1.getFavoriteKeys()
        .then(keys => {
          if (keys){
            this.updateState({favoriteKeys:keys});
          }
          this.flushFavoriteState();
        })
        .catch(e=>{
          this.flushFavoriteState();
          console.log(e);
        })



  }

  flushFavoriteState(){

      let projectModels = [];
      let items = this.items;
      for (var i=0,len = items.length;i<len;i++){
        projectModels.push(new ProjectModel(items[i],FavoriteUtils.checkFavorite(items[i]),this.state.favoriteKeys));

      }

      this.updateState({
        isLoading:false,
        dataSource:this.getDataSource(projectModels),
        rightButtonText:'搜索',
      })
  }


  getDataSource(projectModels){
      return this.state.dataSource.cloneWithRows(projectModels);

  }

  onSelectRepository(projectModel){
    this.props.navigator.push({
      component:RepositoryDetailPage,
      title:projectModel.item.full_name,
      params:{
        projectModel:projectModel,
        flag:FLAG_STORAGE.flag_popular,
          ...this.props,
      }
    })

  }



  renderRow(projectModel){
    return <RepositoryCell
        theme={this.props.theme}
        key={projectModel.item.id}
        projectModel={projectModel}
        onSelect={() => this.onSelectRepository(projectModel)}
        onFavorite={(item,isFavorite) => ActionUtils.onFavorite(this.favoriteDao1,item,isFavorite)}

    />

  }

  renderNavigationBar(){

    let backButton = ViewUtils.getLeftButton(() => this.onBackPress());
    let inputView = <TextInput
        ref = 'input'
        style={styles.textInputStyle}
        onChangeText={text => this.inputKey = text}
    >

    </TextInput>

    let rightButton = <TouchableOpacity
        onPress = {() => {
          this.refs.input.blur();//隐藏键盘，失去焦点
          this.onRightButtonClick();
        }}
    >

      <View style={{marginRight:10,marginLeft:10}}>
        <Text style={styles.navRightButtonTextStyle}>{this.state.rightButtonText}</Text>
      </View>

    </TouchableOpacity>

      return <View style={[styles.navBarStyle,{backgroundColor:this.state.theme.themeColor}]}>
        {backButton}
        {inputView}
        {rightButton}
      </View>


  }


  render() {

    let statusBar = null;
    if (Platform.OS === 'ios'){
      statusBar = <View style={[styles.statusBarStyle,{backgroundColor:this.state.theme.themeColor}]}/>
    }

    let listView = !this.state.isLoading?<ListView
        enableEmptySections={true}
        dataSource={this.state.dataSource}
        renderRow = {projectModel => this.renderRow(projectModel)}
    />:null;

    let indicatorView = this.state.isLoading ?
        <ActivityIndicator
            style={styles.centering}
            size='large'
            animating={this.state.isLoading}
        />:null;

    let resultView = <View style={{flex:1}}>
      {listView}
      {indicatorView}
    </View>

    let bottomButton = this.state.showBottomButton ? <TouchableOpacity
        style={[styles.bottomButtonViewStyle,{backgroundColor:this.state.theme.themeColor}]}
        onPress={() => this.saveKey()}
    >
      <View style={{justifyContent:'center'}}>
        <Text style={styles.bottomButtonTitleStyle}>添加标签</Text>
      </View>

    </TouchableOpacity>:null;
    return (
        <View style={styles.container}>
          {statusBar}
          {this.renderNavigationBar()}
          {resultView}
          {bottomButton}
          <Toast ref={toast => this.toast = toast}/>

        </View>
    );
  }

}


const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'white',
    alignItems:'stretch'


  },

  statusBarStyle:{
    height:20,
  },

  centering:{
    alignItems:'center',
    justifyContent:'center',
    flex:1,

  },

  bottomButtonViewStyle:{
    alignItems:'center',
    justifyContent:'center',
    opacity:0.8,
    height:40,
    position:'absolute',
    left:10,
    right:10,
    bottom:10,
    borderRadius:4,


  },


  bottomButtonTitleStyle:{
    fontSize:17,
    color:'white',
    fontWeight:'500'


  },

  navRightButtonTextStyle:{
    color:'white',
    fontSize:17,
    fontWeight:'500',


  },

  navBarStyle:{
    flexDirection:'row',
    alignItems:'center',
    height:Platform.OS === 'ios' ?GlobalStyles.nav_bar_height_ios:GlobalStyles.nav_bar_height_android

  },

  textInputStyle:{
    flex:1,
    color:'white',
    borderColor:'white',
    opacity:0.7,
    borderWidth:Platform.OS === 'ios' ? 1: 0,
    height:Platform.OS === 'ios' ?30:40,
    alignSelf:'center',
    paddingLeft:5,
    marginRight:10,
    marginLeft:5,
    borderRadius:4,


  },


})