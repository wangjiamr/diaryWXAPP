const cloud = require('wx-server-sdk')

class UserClothesDao {

  async getListByUserId(userId) {
    const db = cloud.database()
    let data = []
    await db.collection('user_clothes').where({
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

  async getListByUserIdCarId(userId, clothesId) {
    const db = cloud.database()
    let data = []
    await db.collection('user_clothes').where({
      _userId: userId,
      _clothesId: clothesId
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
      await db.collection('user_clothes').add({
        data: saveData
      }).then(res => {
        data = res._id
      })
    } else if (persistent === 'update') {
      const id = saveData['_id']
      delete saveData['_id']
      await db.collection('user_clothes').doc(id).update({
        data: saveData
      }).then(res => {
      })
    }
    return data
  }

  async deleteById(id) {
    const db = cloud.database()
    let data = {}
    await db.collection('user_clothes').doc(id).remove().then(res => {
    })
    return data
  }
}
module.exports = UserClothesDao