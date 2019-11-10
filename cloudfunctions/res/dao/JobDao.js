const cloud = require('wx-server-sdk')

class JobDao {

  async getList(gender) {
    const db = cloud.database()
    let data = []
   
    await  db.collection('res_job').where({
      gender: gender
    }).orderBy('price', 'asc').get().then(res => {
      data = res.data
    })

    return data
  }

  async getRequireListByJobId(jobId) {
    const db = cloud.database()
    let data = []

    await db.collection('res_job_require').where({
      _jobId: jobId
    }).get().then(res => {
      data = res.data
    })

    return data
  }

  async getEffectListByJobId(jobId) {
    const db = cloud.database()
    let data = []

    await db.collection('res_job_effect').where({
      _jobId: jobId
    }).get().then(res => {
      data = res.data
    })
    return data
  }


  async init() {
    const db = cloud.database()
    let jobDataArray = []
    await db.collection('res_job').get().then(res => {
      jobDataArray = res.data
    })
    if (jobDataArray.length > 0) {
      for (let job of jobDataArray) {
        db.collection('res_job_effect').where({ jobId: job.id }).update({ data: { _jobId: job._id } })
        db.collection('res_job_require').where({ jobId: job.id }).update({ data: { _jobId: job._id } })

        console.info(job._id + '    ok');
      }
    }
  }
}
module.exports = JobDao