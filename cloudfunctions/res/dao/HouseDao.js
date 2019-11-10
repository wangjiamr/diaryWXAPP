const cloud = require('wx-server-sdk')

class HouseDao {

  async getList() {
    const db = cloud.database()
    let data = []

    await db.collection('res_house').orderBy('buyPrice', 'asc').get().then(res => {
      data = res.data
    })

    return data
  }

  async init() {
    const db = cloud.database()
    let jobDataArray = []
    await db.collection('res_house').get().then(res => {
      jobDataArray = res.data
    })
    if (jobDataArray.length > 0) {
      for (let job of jobDataArray) {
        db.collection('res_house_effect').where({ houseId: job.id }).update({ data: { _houseId: job._id } })

        console.info(job._id + '    ok');
      }
    }
  }
}
module.exports = HouseDao