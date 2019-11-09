const cloud = require('wx-server-sdk')

class UserHouseDao {

  async getListByUserId(userId) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_house').where({
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

  async add(data) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_house').add({
      data
    }).then(res => {
      data = res._id
    })
    return data
  }
}
module.exports = UserHouseDao