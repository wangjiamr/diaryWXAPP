const cloud = require('wx-server-sdk')

class TipDao {

  async getList() {
    const db = cloud.database()
    let data = {}

    await db.collection('res_tip').get().then(res => {
      data = res.data
    })

    return {
      data
    }
  }
}
module.exports = TipDao