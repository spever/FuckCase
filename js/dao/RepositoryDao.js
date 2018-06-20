import {
  AsyncStorage
} from 'react-native';
import GitHubTrending from "GitHubTrending/trending/GitHubTrending";


export const FLAG_STORAGE = {flag_popular:'popular',flag_trending:'trending',flag_mine:'mine'};
export default class RepositoryDao{

  constructor(flag) {
    this.flag = flag;
    if (flag === FLAG_STORAGE.flag_trending) this.trending = new GitHubTrending();
  }

  //获取数据
  fetchRepository(url){
    return new Promise((resolve, reject) => {
      this.fetchLocalRepository(url).then(wrapData => {
        //本地缓存成功
        if (wrapData){
          //缓存对象存在
          resolve(wrapData,true);
        }else {
          //缓存对象不存在，进行网络请求
          this.fetchNetRepository(url)
              //网络请求成功
              .then((data) => {
                resolve(data);
              })
              //网络请求失败
              .catch(e => {
                reject(e);
              })
        }
      })

    })
  }

  fetchLocalRepository(url){
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(url,((error, result) => {
        if (!error){

          try {
            //必须使用pares解析成对象
            resolve(JSON.parse(result));

          }catch (e){
            //解析失败
            reject(e);
          }
        }else {

          //获取缓存失败
          reject(error);

        }
      }))
    })

  }

  fetchNetRepository(url){
    return new Promise((resolve, reject) => {
      if (this.flag !== FLAG_STORAGE.flag_trending){
        fetch(url)
            .then(response => response.json())
            .catch((error) => {
              reject(error);
            }).then((responseData) => {

              if (this.flag === FLAG_STORAGE.flag_mine && responseData){
                this.saveRepository(url,responseData);
                resolve(responseData);

              }else if (responseData && responseData.items){
                this.saveRepository(url,responseData.items);
                resolve(responseData);

              }else {
                reject(new Error('responseData is null'));
              }
        })
      }else {
        this.trending.fetchTrending(url)
            .then(items => {
              if (!items){
                reject(new Error('responseData is null'));
                return;
              }
              resolve(items);
              this.saveRepository(url,items);
            }).catch((error) =>{
              reject(error);
        })

      }
    })
  }


  saveRepository(url, items,callBack) {
    if (!url || !items) return;
    let wrapData;
    if (this.flag === FLAG_STORAGE.flag_mine){
      wrapData = {item:items,update_date:new Date().getTime()};
    }else {
      wrapData = {items:items,update_date:new Date().getTime()};
    }

    AsyncStorage.setItem(url,JSON.stringify(wrapData),callBack);
  }
}