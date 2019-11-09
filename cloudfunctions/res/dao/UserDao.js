const cloud = require('wx-server-sdk')

class UserDao {

  async getUserById(userId) {
    const db = cloud.database()
    let data = {}
    await db.collection('user').doc(userId).get().then(res => {
      data = res.data
    })
    return data
  }

  async update(userId, updateData) {
    const db = cloud.database()
    let data = {}
    await db.collection('user').doc(userId).update({ data: updateData}).then(res => {
      console.info('update data+' + JSON.stringify(res))
      // data = res.data
    })
    return data
  }

  async incPlayNumber(userId) {
    const db = cloud.database()
    const _ = db.command
    let data = {}
    await db.collection('user').doc(userId).update({
      data: {
        playNumber: _.inc(1)
      }
    }).then(res => {
      console.info('update data+' + JSON.stringify(res))
      data = res.stats.updated
    })
    return data
  }
}
module.exports = UserDao