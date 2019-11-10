const cloud = require('wx-server-sdk')

class CarDao {

  async getList() {
    const db = cloud.database()
    let data = {}

    await db.collection('res_car').orderBy('buyPrice', 'asc').get().then(res => {
      data = res.data
    })

    return {
      data
    }
  }

  async init() {
    const db = cloud.database()
    let jobDataArray = []
    await db.collection('res_car').get().then(res => {
      jobDataArray = res.data
    })
    console.info(jobDataArray.length + '    ok');
    if (jobDataArray.length > 0) {
      for (let job of jobDataArray) {
        db.collection('res_car_effect').where({ carId: job.id }).update({ data: { _carId: job._id } })

        console.info(job._id + '    ok');
      }
    }
  }
}
module.exports = CarDao