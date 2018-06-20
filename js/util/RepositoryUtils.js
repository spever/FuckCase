import RepositoryDao, {FLAG_STORAGE} from "../dao/RepositoryDao";
import TimeUtils from "./TimeUtils";

export default class RepositoryUtils {

  constructor(aboutCommon) {
    this.aboutCommon = aboutCommon;
    this.dataRepository = new RepositoryDao(FLAG_STORAGE.flag_mine);
    this.itemMap = new Map();


  }

  updateData(key,value){
    this.itemMap.set(key,value);
    var arr = [];
    for (var value of this.itemMap.values()){
          arr.push(value);
    }

    this.aboutCommon.onNotifyDataChanged(arr)

  }


  fetchRepository(url){

    this.dataRepository.fetchRepository(url)
        .then(result =>{
          if (result){
            this.updateData(url,result);
            if (!TimeUtils.checkDate(result.update_date)){
                return this.dataRepository.fetchNetRepository(url);

            }
          }
        })
        .then((item) => {
          if (item){
            this.updateData(url,item);
          }
        })
        .catch(e => {
          reject(e);
        })

  }


  //批量获取URL对应的数据
  fetchRepositorys(urls){
    for (let i=0;i<urls.length;i++){
        url = urls[i];
        this.fetchRepository(url);

    }

  }

}