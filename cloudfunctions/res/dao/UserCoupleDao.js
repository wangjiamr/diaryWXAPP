const cloud = require('wx-server-sdk')

class UserCoupleDao {

  async getByUserId(userId) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_couple').where({
      _userId: userId
    }).get().then(res => {
      if (res.data.length > 0) {
        data = res.data[0]
      } else {
        data = false
      }
    })
    return data
  }

  async add(data) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_couple').add({
      data
    }).then(res => {
      data = res._id
    })
    return data
  }
}
module.exports = UserCoupleDao