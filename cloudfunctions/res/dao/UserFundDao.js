const cloud = require('wx-server-sdk')

class UserFundDao {

  async getListByUserId(userId) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_fund').where({
      _userId: userId
    }).get().then(res => {
      if (res.data.length > 0) {
        data = res.data
      } else {
        data = false
      }
    })
    return data
  }

  async getSumByUserId(userId) {
    const db = cloud.database()
    const $ = db.command.aggregate
    let totalMoney=0
    await db.collection('user_fund').aggregate()
      .match({
        _userId: userId
      }).group({
        _id: null,
        totalMoney: $.sum('$MONEY')
      }).end().then(res => {
        if(res.list.length>0){
          totalMoney = res.list[0].totalMoney
        }else{
          totalMoney=0
        }
    })
    return totalMoney
  }

}
module.exports = UserFundDao