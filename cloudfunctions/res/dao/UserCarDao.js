const cloud = require('wx-server-sdk')

class UserCarDao {

  async getListByUserId(userId) {
    const db = cloud.database()
    let data = []
    console.info(userId)
    await db.collection('user_car').where({
      _userId: userId
    }).get().then(res => {
      console.info(JSON.stringify(res))
      if (res.data.length > 0) {
        data = res.data
      } else {
        data = false
      }
    })
    return data
  }

  async getListByUserIdCarId(userId,carId) {
    const db = cloud.database()
    let data = []
    await db.collection('user_car').where({
      _userId: userId,
      _carId:carId
    }).get().then(res => {
      if (res.data.length > 0) {
        data = res.data
      } else {
        data = false
      }
    })
    return data
  }

  async save(saveData, persistent) {
    const db = cloud.database()
    let data = {}
    if (persistent === 'add') {
      await db.collection('user_car').add({
        data: saveData
      }).then(res => {
        data = res._id
      })
    } else if (persistent === 'update') {
      const id = saveData['_id']
      delete saveData['_id']
      await db.collection('user_car').doc(id).update({
        data: saveData
      }).then(res => {
      })
    }
    return data
  }

  async deleteById(id) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_car').doc(id).remove().then(res => {
    })
    return data
  }
}
module.exports = UserCarDao