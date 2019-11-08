const cloud = require('wx-server-sdk')

class JobDao {

  async getJobList(gender) {
    const db = cloud.database()
    let data = {}
   
    await  db.collection('res_job').where({
      gender: gender
    }).orderBy('price', 'asc').get().then(res => {
      data = res.data
    })

    return {
      data
    }
  }
}
module.exports = JobDao