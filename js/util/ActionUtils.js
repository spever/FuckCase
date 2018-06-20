import {FLAG_STORAGE} from "../dao/RepositoryDao";

export default class ActionUtils{

  static onFavorite(favoriteDao,item,isFavorite,flag){

    //写进数据库，使用string
    let key = null;
    if (flag === FLAG_STORAGE.flag_popular){
        key = item.id.toString();
    }else if (flag === FLAG_STORAGE.flag_trending){
        key = item.fullName;
    }else {
      key = '';
    }

    if (isFavorite){
        favoriteDao.saveFavoriteItem(key,JSON.stringify(item));
    }else {
        favoriteDao.removeFavoriteItem(key);
    }
  }

}