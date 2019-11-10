const cloud = require('wx-server-sdk')

class UserManDao {

  async getById(id) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_man').doc(id).get().then(res => {
      data = res.data
    })
    return data
  }

  async getByUserId(userId) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_man').where({
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
    await db.collection('user_man').add({
      data: userData
    }).then(res => {
      console.info('add data+' + JSON.stringify(res))
      data = res._id
    })
    return data
  }
}
module.exports = UserManDao