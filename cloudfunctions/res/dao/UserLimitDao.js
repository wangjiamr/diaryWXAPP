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
}
module.exports = UserLimitDao