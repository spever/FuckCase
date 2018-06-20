import {
  Dimensions
} from 'react-native';

const {height,width} = Dimensions.get("window");


//导出样式
module.exports ={

  cellBottomLineStyle:{
    backgroundColor:'darkgray',
    height:0.4,
    opacity:0.5

  },

  cell_container:{

  },

  listViewContainerStyle:{
    flex:1,
    backgroundColor:'#f3f3f3'


  },

  listView_container:{
    flex:1,
    backgroundColor:'#f3f3f3'

  },

  backgroundColor:'#f3f3f4',
  listView_height:(height-(20+40)),
  window_height:height,
  window_width:width,
  nav_bar_height_ios:44,
  nav_bar_height_android:50,
};