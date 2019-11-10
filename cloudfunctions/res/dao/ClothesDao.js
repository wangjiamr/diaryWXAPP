const cloud = require('wx-server-sdk')

class ClothesDao {

  async getList(gender) {
    const db = cloud.database()
    let data = []

    await db.collection('res_clothes').where({
      gender: gender
    }).orderBy('buyPrice', 'asc').get().then(res => {
      data = res.data
    })

    return data
  }

  async init() {
    const db = cloud.database()
    let jobDataArray = []
    await db.collection('res_clothes').get().then(res => {
      jobDataArray = res.data
    })
    console.info(jobDataArray.length + '    ok');
    if (jobDataArray.length > 0) {
      for (let job of jobDataArray) {
        db.collection('res_clothes_effect').where({ clothesId: job.id }).update({ data: { _clothesId: job._id } })

        console.info(job._id + '    ok');
      }
    }
  }
}
module.exports = ClothesDao