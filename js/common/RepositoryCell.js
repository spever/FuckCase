import React,{Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity
} from 'react-native'
export default class RepositoryCell extends Component{

  constructor(props) {
    super(props);
    this.state = {
      //是否被选中收藏：是由popular页面传递过来
      isFavorite:this.props.projectModel.isFavorite,
      //收藏的图标
      favoriteIcon:this.props.projectModel.isFavorite?require('../../res/images/ic_star.png'):require('../../res/images/ic_unstar_transparent.png')

    }
  }


  componentWillReceiveProps(nextProps) {
    this.setFavoriteState(nextProps.projectModel.isFavorite);

  }


  render() {

    let item = this.props.projectModel.item?this.props.projectModel.item:this.props.projectModel;

    let favoriteButton = <TouchableOpacity
        onPress = {() => this.onPressFavorite()}
        >
          <Image
                style = {[styles.favoriteImageStyle,this.props.theme.styles.tabBarSelectedIcon]}
                source= {this.state.favoriteIcon}
          />
        </TouchableOpacity>;

    return (
        <TouchableOpacity
            onPress={this.props.onSelect}
            style={styles.container}
        >
          <View style={styles.cellContainerViewStyle}>
            <Text style={styles.title}>{item.ful_name}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.bottomContainerViewStyle}>
                <View style={styles.authorContainerViewStyle}>
                  <Text style={styles.bottomTextStyle}>Author:</Text>
                  <Image
                      style={styles.authorAvatarImageStyle}
                      source={{uri:item.owner.avatar_url}}
                  />
                </View>

                <View style={styles.starContainerViewStyle}>
                  <Text style={styles.bottomTextStyle}>Stars:</Text>
                  <Text style={styles.bottomTextStyle}>{item.stargazers_count}</Text>
                </View>

              {favoriteButton}
            </View>
          </View>

        </TouchableOpacity>
    );
  }


  onPressFavorite() {
    this.setFavoriteState(!this.state.isFavorite);
    this.props.onFavorite(this.props.projectModel.item,!this.state.isFavorite)
  }

  setFavoriteState(isFavorite) {
    this.props.projectModel.isFavorite =isFavorite;
    this.setState({
      isFavorite:isFavorite,
      favoriteIcon:isFavorite?require('../../res/images/ic_star.png'):require('../../res/images/ic_unstar_transparent.png')
    })

  }
}


const styles = StyleSheet.create({

  cellContainerViewStyle:{
    backgroundColor:'white',
    padding:10,
    marginTop:4,
    marginLeft:6,
    marginRight:6,
    marginVertical:2,
    borderWidth:2,
    borderColor:'#dddddd',
    borderRadius:1,
    //ios阴影
    shadowColor:'#b5b5b5',
    shadowOffset:{width:3,height:2},
    shadowOpacity:0.4,
    //Android阴影
    elevation:2

  },

  title:{
    fontSize:15,
    marginBottom:2,
    color:'#212121'

  },

  description:{
    fontSize:12,
    marginBottom:2,
    color:'#757575'

  },

  bottomContainerViewStyle:{
    flexDirection:'row',
    justifyContent:'space-between' //两端对齐，子元素间留有空隙

  },

  authorContainerViewStyle:{
    flexDirection:'row',
    alignItems:'center'

  },

  starContainerViewStyle:{
    flexDirection:'row',
    alignItems:'center'
  },

  bottomTextStyle:{
    fontSize:11
  },

  authorAvatarImageStyle:{
    width:16,
    height:16
  },

  favoriteImageStyle:{
    width:18,
    height:18
  }
})