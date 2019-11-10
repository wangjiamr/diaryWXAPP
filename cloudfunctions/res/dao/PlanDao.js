const cloud = require('wx-server-sdk')

class PlanDao {

  async getList(gender) {
    const db = cloud.database()
    let data = []

    await db.collection('res_plan').where({
      gender: gender
    }).orderBy('displayOrder', 'asc').get().then(res => {
      data = res.data
    })

    return data
  }

  async init() {
    const db = cloud.database()
    let jobDataArray = []
    await db.collection('res_plan').get().then(res => {
      jobDataArray = res.data
    })
    console.info(jobDataArray.length + '    ok');
    if (jobDataArray.length > 0) {
      for (let job of jobDataArray) {
        db.collection('res_plan_effect').where({ planId: job.id }).update({ data: { _planId: job._id } })

        console.info(job._id + '    ok');
      }
    }
  }
}
module.exports = PlanDao