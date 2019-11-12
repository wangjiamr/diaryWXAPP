const {
  minish,
  formatNumber,
  addResultArray,
  requirePass,
  useEffect,
  diffEffectMan,
  diffEffectLady, failAttrNames
} = require('../utils/GameUtils.js')
const CommonResponse = require('../utils/CommonResponse.js')
const JobDao = require('../dao/JobDao.js')


const UserManDao = require('../dao/UserManDao.js')
const UserLadyDao = require('../dao/UserLadyDao.js')
const UserJobDao = require('../dao/UserJobDao.js')
const UserLimitDao = require('../dao/UserLimitDao.js')


const jobDao = new JobDao()

const userManDao = new UserManDao()
const userLadyDao = new UserLadyDao()
const userJobDao = new UserJobDao()
const userLimitDao = new UserLimitDao()

class UserJobService {

  constructor() {}

  async applyJob(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      jobId,
      gender
    } = event
    let data = {}
    let result = CommonResponse(-1, 'fail', data)
    let userObj
    if (gender == 1) {
      userObj = await userManDao.getByUserId(userId)
    } else {
      userObj = await userLadyDao.getByUserId(userId)
    }

    let jobRequireGet = new Promise((resolve, reject) => {
      const jobRequireList = jobDao.getRequireListByJobId(jobId)
      resolve(jobRequireList)
    })

    let jobEffectGet = new Promise((resolve, reject) => {
      const jobEffectList = jobDao.getEffectListByJobId(jobId)
      resolve(jobEffectList)
    })

    let userJobGet = new Promise((resolve, reject) => {
      const userJob = userJobDao.getByUserId(userId)
      resolve(userJob)
    })

    let userJobLimitGet = new Promise((resolve, reject) => {
      const jobLimit = userLimitDao.getCountByUserIdDayAction(userId, userObj.days, 'JOB')
      resolve(jobLimit)
    })
    let jobRequireGetResult=[], jobEffectGetResult=[], userJobGetResult={}, userJobLimitGetResult={}
    await Promise.all([jobRequireGet, jobEffectGet, userJobGet, userJobLimitGet]).then((results) => {
      jobRequireGetResult = results[0]
      jobEffectGetResult = results[1]
      userJobGetResult = results[2]
      userJobLimitGetResult = results[3]
    }).catch((error) => {
      console.log(error)
    })
    await proccess(userId,
      jobId,
      gender, jobRequireGetResult, jobEffectGetResult, userJobGetResult, userJobLimitGetResult, userObj, data)
    
    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }
}
async function proccess(userId,
  jobId,
  gender, jobRequireGetResult, jobEffectGetResult, userJobGetResult, userJobLimitGetResult, userObj,  data) {
  let pass = requirePass(jobRequireGetResult, userObj)
  let jobLimitData = {}
  if (userJobLimitGetResult == 0) {
    jobLimitData._userId = userId
    jobLimitData.action = 'JOB'
    jobLimitData.day = userObj.days
  }
  if (pass && userJobLimitGetResult == 0) {
    let oldUserObj = Object.assign({}, userObj)
    let persistentJob = 'update'
    let saveData = {}
    if (!userJobGetResult) {
      persistentJob = 'add'
      saveData._userId = userId
      saveData._jobId = jobId
    } else {
      saveData._id = userJobGetResult._id
      saveData._jobId = jobId
    }
    useEffect(jobEffectGetResult, userObj)
    await userJobDao.save(saveData, persistentJob)
    let effectArray = []
    if (gender == 1) {
      effectArray = diffEffectMan(oldUserObj, userObj)
      await userManDao.save(userObj, 'update')
    } else {
      effectArray = diffEffectLady(oldUserObj, userObj)
      await userLadyDao.save(userObj, 'update')
    }
    await userLimitDao.save(jobLimitData, 'add')
    let resultArray = []
    addResultArray(resultArray, '恭喜你轻而易举的得到了面试官的认可，获得了工作！', false)
    addResultArray(resultArray, '最终:', effectArray)
    data.resultArray = resultArray
  } else {
    if (userJobLimitGetResult==1){
      let resultArray = []
      addResultArray(resultArray, '抱歉，每日只能应聘一次工作！', false)
      data.resultArray = resultArray
    }else{
      let resultArray = []
      let failAttrName = []
      failAttrName = failAttrNames(jobRequireGetResult,userObj,gender)
      await userLimitDao.save(jobLimitData, 'add')
      addResultArray(resultArray, '你卖力的表现了下自己，但是面试官觉得你的能力无法胜任这份工作！', false)
      addResultArray(resultArray, '要求:', failAttrName)
      data.resultArray = resultArray
    }
  }
}
module.exports = UserJobService