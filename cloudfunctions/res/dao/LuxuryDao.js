const cloud = require('wx-server-sdk')

class LuxuryDao {

  async getList(gender) {
    const db = cloud.database()
    let data = []

    await db.collection('res_luxury').where({
      gender: gender
    }).orderBy('buyPrice', 'asc').get().then(res => {
      data = res.data
    })

    return data
  }

  async getById(luxuryId) {
    const db = cloud.database()
    let data = {}

    await db.collection('res_luxury').doc(luxuryId).get().then(res => {
      data = res.data
    })
    return data
  }

  async getEffectListByLuxuryId(luxuryId) {
    const db = cloud.database()
    let data = []

    await db.collection('res_luxury_effect').where({
      _luxuryId: luxuryId
    }).get().then(res => {
      data = res.data
    })
    return data
  }

  async init() {
    const db = cloud.database()
    let jobDataArray = []
    await db.collection('res_luxury').get().then(res => {
      jobDataArray = res.data
    })
    console.info(jobDataArray.length + '    ok');
    if (jobDataArray.length > 0) {
      for (let job of jobDataArray) {
        db.collection('res_luxury_effect').where({ luxuryId: job.id }).update({ data: { _luxuryId: job._id } })

        console.info(job._id + '    ok');
      }
    }
  }
}
module.exports = LuxuryDao