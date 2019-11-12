const cloud = require('wx-server-sdk')

class LuckDao {

  async getById(luckId) {
    const db = cloud.database()
    let data = {}

    await db.collection('res_luck').doc(luckId).get().then(res => {
      data = res.data
    })
    return data
  }

  async getList() {
    const db = cloud.database()
    let data = []

    await db.collection('res_luck').orderBy('investPrice', 'asc').get().then(res => {
      data = res.data
    })

    return data
  }
}
module.exports = LuckDao