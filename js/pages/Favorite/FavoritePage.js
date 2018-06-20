import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ListView,
  RefreshControl,
  DeviceEventEmitter
} from 'react-native';
import BaseComponent from "../../base/BaseComponent";
import ScrollableTabView, {ScrollableTabBar} from "react-native-scrollable-tab-view";
import NavigationBar from "../../common/NavigationBar";
import ViewUtils from "../../util/ViewUtils";
import {FLAG_STORAGE} from "../../dao/RepositoryDao";
import RepositoryCell from "../../common/RepositoryCell";
import TrendingCell from "../../common/TrendingCell";
import ActionUtils from "../../util/ActionUtils";
import ArrayUtils from "../../util/ArrayUtils";
import ProjectModel from "../../model/ProjectModel";
import RepositoryDetailPage from "../../common/RepositoryDetailPage";
import FavoriteDao from "../../dao/FavoriteDao";
import {FLAG_TAB} from "../Entry/HomePage";
import MoreMenu, {MORE_MENU} from "../../common/MoreMenu";

export default class FavoritePage extends BaseComponent {


  constructor(props) {
    super(props);
    this.state = {
      theme:this.props.theme,
      customThemeVisible:false,
    }
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
        menus={[MORE_MENU.Custom_Theme,MORE_MENU.About_Author,MORE_MENU.About]}
        anchorView={this.refs.moreMenuButton}
        onMoreMenuSelect={e => {
          if (e === MORE_MENU.Custom_Theme){
            this.setState({
              customThemeVisible:true,
            })
          }

        }
        }
    />
  }


  render() {

    let content = <ScrollableTabView
        tabBarBackgroundColor={this.state.theme.themeColor}
        tabBarInactiveTextColor='mintcream'
        tabBarActiveTextColor='white'
        tabBarUnderlineStyle={{backgroundColor:'#e7e7e7',height:2}}
        renderTabBar={() => <ScrollableTabBar/>}

    >
      <FavoriteTabPage {...this.props} tabLabel='最热' flag={FLAG_STORAGE.flag_popular}/>
      <FavoriteTabPage {...this.props} tabLabel='趋势' flag={FLAG_STORAGE.flag_trending}/>
    </ScrollableTabView>;

    return (
        <View style={styles.container}>
          <NavigationBar
            title={'收藏'}
            style={this.state.theme.styles.navBar}
            statusBar={{backgroundColor:this.state.theme.themeColor}}
            rightButton={this.renderNavRightButton()}

          />
          {content}
          {this.renderMoreView()}
        </View>
    );
  }

}



class FavoriteTabPage extends Component{

  constructor(props) {
    super(props);
    this.favoriteDao1 = new FavoriteDao(this.props.flag);
    this.unFavoriteItems = [];
    this.state={
      dataSource:new ListView.DataSource({rowHasChanged:(r1, r2) =>r1!==r2}),
      isLoading:false
    }
  }


  componentDidMount() {
    this.loadData();
  }


  componentWillReceiveProps(nextProps) {
    this.loadData(false)
  }

  onSelectRepository(projectModel){
    this.props.navigator.push({
      title:projectModel.item.full_name,
      component:RepositoryDetailPage,
      params:{
        projectModel:projectModel,
        ...this.props
      }
    })


  }

  renderRow(projectModel){

    let CellComponent = this.props.flag === FLAG_STORAGE.flag_popular ?RepositoryCell:TrendingCell;
    return <CellComponent
        onSelect={() => this.onSelectRepository(projectModel)}
        theme={this.props.theme}
        key={this.props.flag === FLAG_STORAGE.flag_popular?projectModel.item.id:projectModel.item.fullName}
        projectModel={projectModel}
        onFavorite={(item,isFavorite) => this.onFavorite(item,isFavorite)}
    />

  }


  onFavorite(item,isFavorite){

    ActionUtils.onFavorite(this.favoriteDao1,item,isFavorite,this.props.flag);

    ArrayUtils.updateArray(this.unFavoriteItems,item);

    if (this.unFavoriteItems.length>0){

        if (this.props.flag === FLAG_STORAGE.flag_popular){

          DeviceEventEmitter.emit('favoriteChanged_popular');

        }else if (this.props.flag === FLAG_STORAGE.flag_trending){

          DeviceEventEmitter.emit('favoriteChanged_trending');

        }else {

        }

    }


  }

  getDataSource(projectModels){
    return this.state.dataSource.cloneWithRows(projectModels)

  }


  loadData(showLoading){

    if (showLoading){
        this.setState({
          isLoading:true
        })

    }

    this.favoriteDao1.getAllItems()
        .then((items) => {
          var resultData = [];
          for (var i=0,len = items.length;i<len;i++){
              resultData.push(new ProjectModel(items[i],true));
          }
          this.setState({
            isLoading:false,
            dataSource:this.getDataSource(resultData)
          })
        })
        .catch((error) => {
          console.log(error);
          this.setState({
            isLoading:false,
          })
        })



  }


  render() {
    return (
        <View style={{flex:1}}>
          <ListView
              enableEmptySections={true}
              dataSource={this.state.dataSource}
              renderRow={(data) => this.renderRow(data)}
              refreshControl={
                <RefreshControl
                    refreshing={this.state.isLoading}
                    onRefresh={() => this.loadData()}
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


const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'white'
  }
})

