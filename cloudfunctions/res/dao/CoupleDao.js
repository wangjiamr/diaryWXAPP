const cloud = require('wx-server-sdk')

class CoupleDao {

  async getList(gender) {
    const db = cloud.database()
    let data = []

    await db.collection('res_couple').where({
      gender: gender
    }).get().then(res => {
      data = res.data
    })

    return data
  }

  async init() {
    const db = cloud.database()
    let jobDataArray = []
    await db.collection('res_couple').get().then(res => {
      jobDataArray = res.data
    })
    if (jobDataArray.length > 0) {
      for (let job of jobDataArray) {
        db.collection('res_couple_effect').where({ coupleId: job.id }).update({ data: { _coupleId: job._id } })
        db.collection('res_couple_require').where({ coupleId: job.id }).update({ data: { _coupleId: job._id } })

        console.info(job._id + '    ok');
      }
    }
  }
}
module.exports = CoupleDao