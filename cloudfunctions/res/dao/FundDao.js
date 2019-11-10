const cloud = require('wx-server-sdk')

class FundDao {

  async getList() {
    const db = cloud.database()
    let data = []

    await db.collection('res_fund').orderBy('probability', 'desc').get().then(res => {
      data = res.data
    })

    return data
  }

  async getById(id) {
    const db = cloud.database()
    let data = {}
    await db.collection('res_fund').doc(id).get().then(res => {
      data = res.data
    })
    return {
      data
    }
  }
}
module.exports = FundDao