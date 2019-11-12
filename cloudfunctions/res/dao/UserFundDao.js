const cloud = require('wx-server-sdk')

class UserFundDao {

  async getListByUserId(userId) {
    const db = cloud.database()
    let data = []
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

  async getMarketByUserFundId(userId,fundId) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_fund_market').where({
      _userId: userId,
      _fundId: fundId
    }).get().then(res => {
      if (res.data.length > 0) {
        data = res.data[0]
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

  async save(saveData, persistent) {
    const db = cloud.database()
    let data = {}
    if (persistent === 'add') {
      await db.collection('user_fund').add({
        data: saveData
      }).then(res => {
        data = res._id
      })
    } else if (persistent === 'update') {
      const id = saveData['_id']
      delete saveData['_id']
      await db.collection('user_fund').doc(id).update({
        data: saveData
      }).then(res => {
      })
    }
    return data
  }

  async saveMarket(saveData, persistent) {
    const db = cloud.database()
    let data = {}
    if (persistent === 'add') {
      await db.collection('user_fund_market').add({
        data: saveData
      }).then(res => {
        data = res._id
      })
    } else if (persistent === 'update') {
      const id = saveData['_id']
      delete saveData['_id']
      await db.collection('user_fund_market').doc(id).update({
        data: saveData
      }).then(res => {
      })
    }
    return data
  }
}
module.exports = UserFundDao