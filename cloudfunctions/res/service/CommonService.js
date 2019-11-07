const CommonResponse = require('../entity/CommonResponse.js')
const JobDao = require('../dao/JobDao.js')
const PlanDao = require('../dao/PlanDao.js')
const UserDao = require('../dao/UserDao.js')

const userDao=new UserDao()
const planDao = new PlanDao()
const jobDao = new JobDao()
class CommonService {

  constructor() {}

  async getResData(ctx, next) {
    const event = ctx._req.event
    let {
      userId
    } = event
    let data = {}
    const user = await userDao.getUserById(userId)
    if (user) {
      data.gender = user.gender
      let jobGet = new Promise((resolve, reject) => {
        const jobArray = jobDao.getJobList(user.gender)
        resolve(jobArray)
      })

      let planGet = new Promise((resolve, reject) => {
        const planArray = planDao.getPlanList(user.gender)
        resolve(planArray)
      })

      await Promise.all([jobGet, planGet]).then((results) => {
        const jobGetResult = results[0]
        const planGetResult = results[1]
        data.jobArray = jobGetResult
        data.planArray = planGetResult
      }).catch((error) => {
        console.log(error)
      })
    }
    ctx.body = CommonResponse(0, 'success', data)
  }
}
module.exports = CommonService