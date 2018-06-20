import React,{Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Alert,
  ScrollView,
  DeviceEventEmitter,
  TouchableOpacity,
} from 'react-native';
import LanguageDao, {FLAG_LANGUAGE} from "../../dao/LanguageDao";
import NavigationBar from "../../common/NavigationBar";
import ViewUtils from "../../util/ViewUtils";
import CheckBox from "react-native-check-box";
import ArrayUtils from "../../util/ArrayUtils";
import {ACTION_HOME, FLAG_TAB} from "../Entry/HomePage";

export default class CustomKeyPage extends Component{

  constructor(props) {
    super(props);
    this.languageDao = new LanguageDao(this.props.flag);
    this.isRemoveKeyPage = this.props.isRemoveKeyPage?true:false;

    this.changeValues = [];
    this.state = {
      originalCheckedArray:[],
      changed:false
    }

  }


  componentDidMount() {
    this.loadData();

  }

  loadData(){

    this.languageDao.fetch()
        .then((resultArr) =>{

          var arr= JSON.parse(JSON.stringify(resultArr));
          if (this.isRemoveKeyPage){
              for (let i =0; i<arr.length; i++){
                    var data = arr[i];
                    data.checked = false;

              }

          }
          this.setState({
            dataArray:arr,
            originalCheckedArray:resultArr
          })

        })
        .catch(error =>{
          console.log(error);
        })

  }

  removeItem(item){
    if (!item) return;
    var removeIndex = -1;
    for (let i=0,l=this.state.originalCheckedArray.length;i<l;i++){

          var originalItem = this.state.originalCheckedArray[i];
          if (item === originalItem){
              removeIndex = i;
          }

    }

    if ( removeIndex > -1){
      this.state.originalCheckedArray.splice(removeIndex,1);

    }

  }


  onSave(){

    if (this.changeValues.length === 0){
        this.props.navigator.pop();
        return;

    }

    if (this.isRemoveKeyPage){

        for (let i=0,l=this.changeValues.length;i<l;i++){
            this.removeItem(this.changeValues[i]);

        }
        this.languageDao.save(this.state.originalCheckedArray);

    }else {
      this.languageDao.save(this.state.dataArray);
    }

    var jumpToTab = this.props.flag === FLAG_LANGUAGE.flag_key?FLAG_TAB.flag_popularTab:FLAG_TAB.flag_trendingTab;
    DeviceEventEmitter.emit('ACTION_HOME',ACTION_HOME.A_RESTART,jumpToTab);
    this.props.navigator.pop();



  }

  goBack(){

    if (this.changeValues.length === 0){
          this.props.navigator.pop();
    }else {
          Alert.alert(
              '提示',
              '要保存修改吗？',
              [
                {text:'不保存',onPress:() =>{

                  },style:'cancel'},
                {
                  text:'保存',onPress:() =>{this.onSave()}
                }
              ]
          );
    }

  }

  onClick(data){

    data.checked = !data.checked;
    ArrayUtils.updateArray(this.changeValues,data);
    this.setState({
      changed:true
    })

  }

  renderCheckBox(data){

    let leftText = data.name;

    return (
        <CheckBox
            style={styles.checkBoxStyle}
            onClick={() => this.onClick(data)}
            isChecked={data.checked}
            leftText={leftText}
            unCheckedImage={
              <Image
                  style={this.props.theme.styles.tabBarSelectedIcon}
                  source={require('../../../res/images/img_my_page/ic_check_box_outline_blank.png')}
              />
            }
            checkedImage={
              <Image
                  style={this.props.theme.styles.tabBarSelectedIcon}
                  source={require('../../../res/images/img_my_page/ic_check_box.png')}
              />
            }
        />

    )
  }

  renderView(){
    if (!this.state.dataArray || this.state.dataArray.length === 0) return;
    let len = this.state.dataArray.length;
    let rowViews = [];
    for (let i = 0,l=len -2 ;i<l;i+=2){
          rowViews.push(
              <View key={i}>
                <View style={styles.item}>
                  {this.renderCheckBox(this.state.dataArray[i])}
                  {this.renderCheckBox(this.state.dataArray[i+1])}
                </View>
                <View style={styles.line}/>
              </View>
          )

    }


    rowViews.push(
        <View key={len-1}>
            <View style={styles.item}>
              {len%2 === 0 ? this.renderCheckBox(this.state.dataArray[len-2]):null}
              {this.renderCheckBox(this.state.dataArray[len-1])}
              <View style={styles.line}/>

            </View>
        </View>
    )

    return rowViews;


  }




  render() {

     let title = this.isRemoveKeyPage?'标签移除':'自定义标签';
     title = this.props.flag === FLAG_LANGUAGE.flag_language?'自定义语言':title;
     let rightButtonTitle = this.isRemoveKeyPage?'移除':'保存';
     let rightButton = <TouchableOpacity
         onPress={() => this.onSave()}
     >
       <View style={{margin:10}}>
         <Text style={styles.title}>{rightButtonTitle}</Text>
       </View>
     </TouchableOpacity>;

    return (
        <View style={styles.container}>
          <NavigationBar
              title={title}
              style={this.props.theme.styles.navBar}
              leftButton={ViewUtils.getLeftButton(() => this.goBack())}
              rightButton={rightButton}
          />

          <ScrollView>
            {this.renderView()}
          </ScrollView>


        </View>
    );
  }


}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'white'
  },

  checkBoxStyle:{
    flex:1,
    padding:20

  },

  title:{
    fontSize:20,
    color:'white'

  },

  item:{
    flexDirection:'row',
    alignItems:'center'
  },

  line:{
    height:0.3,
    backgroundColor:'darkgray'
  }
})