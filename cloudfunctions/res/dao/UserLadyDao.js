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



  async save(saveData, persistent) {
    const db = cloud.database()
    let data = {}
    if (persistent === 'add') {
      await db.collection('user_lady').add({
        data: saveData
      }).then(res => {
        data = res._id
      })
    } else if (persistent === 'update') {
      const id = saveData['_id']
      delete saveData['_id']
      await db.collection('user_lady').doc(id).update({
        data: saveData
      }).then(res => {
      })
    }
    return data
  }
}
module.exports = UserLadyDao