const cloud = require('wx-server-sdk')

class LuckDao {

  async getList() {
    const db = cloud.database()
    let data = {}

    await db.collection('res_luck').orderBy('investPrice', 'asc').get().then(res => {
      data = res.data
    })

    return {
      data
    }
  }
}
module.exports = LuckDao