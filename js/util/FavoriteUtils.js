export default class FavoriteUtils{
  static checkFavorite(item,items){
    if (!items)  return false;
    for (var i=0,len = items.length; i<len; i++){
      let id = item.id ? item.id.toString():item.fullName;
      if (id === items[i]){
        return true;
      }
    }

    return false;

  }
}