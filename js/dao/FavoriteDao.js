import {
  AsyncStorage
} from 'react-native';

const FAVORITE_KEY_PREFIX = 'favorite_'

export default class FavoriteDao{

  constructor(flag) {
    this.flag = flag;
    this.favoriteKey = FAVORITE_KEY_PREFIX + flag;
  }

  //收藏项目，保存收藏的项目
  //key:项目id或名称
  //value：收藏的项目
  saveFavoriteItem(key,value,callBack){

    AsyncStorage.setItem(key,value,(error) => {
      if (!error){
        //更新Favorite的key
        this.updateFavoriteKeys(key,true);
      }
    })

  }



  //移除已经收藏的项目
  removeFavoriteItem(key){
    AsyncStorage.removeItem(key,(error => {
      if (!error){
        this.updateFavoriteKeys(key,false);
      }
    }))

  }

  /**
   * 更新favorite key 集合
   * @param key
   * @param isAdd  true 添加， false 删除
   */
  updateFavoriteKeys(key, isAdd) {
    //拿出用户收藏的所有项目
    AsyncStorage.getItem(this.favoriteKey,(error,result) => {
      if (!error){
        var favoriteKeys = [];
        if (result){
          favoriteKeys = JSON.parse(result);
        }

        var index = favoriteKeys.indexOf(key);

        if (isAdd){
          if (index === -1)
            favoriteKeys.push(key);
        }else {
          if (index !== -1){
            favoriteKeys.splice(index,1);
          }
        }

        AsyncStorage.setItem(this.favoriteKey,JSON.stringify(favoriteKeys));
      }
    })

  }


  //获取所有收藏的项目的key数组
  getFavoriteKeys(){
    return new Promise(((resolve, reject) => {
      AsyncStorage.getItem(this.favoriteKey,(error,result) => {
        if (!error) {
          try {
            resolve(JSON.parse(result));
          }catch (e){
            reject(e);
          }
        }else{
          reject(error);
        }
      })
    }));
  }



  getAllItems(){
    return new Promise((resolve, reject) => {
      this.getFavoriteKeys().then((keys) =>{
        var items = [];
        if (keys){
          AsyncStorage.multiGet(keys,(errors, results) => {
            try {
              results.map((val, index, result) => {
                let key = result[index][0];
                let value = result[index][1];

                if (value) items.push(JSON.parse(value))

              });

              resolve(items);

            }catch (e){
              reject(e);
            }
          })
        }else {
          resolve(items);
        }
      }).catch(e => {
        reject(e);
      })
    })
  }




}