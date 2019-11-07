const cloud = require('wx-server-sdk')

class PlanDao {

  async getPlanList(gender) {
    const db = cloud.database()
    let data = {}

    await db.collection('res_plan').where({
      gender: gender
    }).orderBy('displayOrder', 'asc').get().then(res => {
      data = res.data
    })

    return {
      data
    }
  }
}
module.exports = PlanDao