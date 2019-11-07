const cloud = require('wx-server-sdk')

class UserDao {

  async getUserById(userId) {
    const db = cloud.database()
    let data = {}
    await db.collection('user').doc(userId).get().then(res => {
      data = res.data
    })
    return {
      data
    }
  }
}
module.exports = UserDao