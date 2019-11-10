const cloud = require('wx-server-sdk')

class UserLimitDao {
  async getCountByUserIdDayAction(userId,day,action) {
    const db = cloud.database()
    const $ = db.command.aggregate
    let limitCount = 0
    await db.collection('user_limit').aggregate()
      .match({
        _userId: userId,
        day,
        action
      }).group({
        _id: null,
        limitCount: $.sum(1)
      }).end().then(res => {
        if (res.list.length > 0) {
          limitCount = res.list[0].limitCount
        } else {
          limitCount = 0
        }
      })
    return limitCount
  }

  async save(saveData, persistent) {
    const db = cloud.database()
    let data = {}
    if (persistent === 'add') {
      await db.collection('user_limit').add({
        data: saveData
      }).then(res => {
        data = res._id
      })
    } else if (persistent === 'update') {
      const id = saveData['_id']
      delete saveData['_id']
      await db.collection('user_limit').doc(id).update({
        data: saveData
      }).then(res => {
      })
    }
    return data
  }
}
module.exports = UserLimitDao