const cloud = require('wx-server-sdk')

class UserLadyDao {

  async getByUserId(userId) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_lady').where({
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

  async add(userData) {
    const db = cloud.database()
    let data = {}
    console.info(userData)
    await db.collection('user_lady').add({
      data: userData
    }).then(res => {
      console.info('add data+' + JSON.stringify(res))
      data = res._id
    })
    return data
  }
}
module.exports = UserLadyDao