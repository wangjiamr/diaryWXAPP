const {
  minish,
  formatNumber,
  addResultArray,
  requirePass,
  useEffect,
  diffEffectMan,
  diffEffectLady,
  useHour
} = require('../utils/GameUtils.js')
const CommonResponse = require('../utils/CommonResponse.js')
const PlanDao = require('../dao/PlanDao.js')


const UserManDao = require('../dao/UserManDao.js')
const UserLadyDao = require('../dao/UserLadyDao.js')
const UserPlanDao = require('../dao/UserPlanDao.js')


const planDao = new PlanDao()

const userManDao = new UserManDao()
const userLadyDao = new UserLadyDao()
const userPlanDao = new UserLadyDao()

class UserPlanService {

  constructor() {}

  async applyPlan(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      planId,
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

    let planEffectGet = new Promise((resolve, reject) => {
      const planEffectList = planDao.getEffectListByPlanId(planId)
      resolve(planEffectList)
    })
    let planGet = new Promise((resolve, reject) => {
      const plan = planDao.getById(planId)
      resolve(plan)
    })
    let planEffectList = [],
      plan = {}
    await Promise.all([planEffectGet, planGet]).then((results) => {
      planEffectList = results[0]
      plan = results[1]
    }).catch((error) => {
      console.log(error)
    })

    await proccess(userId,
      planId,
      gender, planEffectList, plan, userObj, data)
    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }
}
async function proccess(userId,
  planId,
  gender, planEffectList, plan, userObj, data) {

  if (planEffectList && planEffectList.length > 0) {
    let effectSubList = []
    for (let effect of planEffectList) {
      if (effect['operation'] === 'SUB' && effect['attrKey'] === 'MONEY') {
        effectSubList.push(effect)
      }
    }
    let pass = requirePass(effectSubList, userObj)
    if (pass) {
      let userPlanData = {
        _userId: userId,
        _planId: planId,
        planOfDay: userObj.days,
        planOfHour: userObj.hours
      }
      let oldUserObj = Object.assign({}, userObj)
      useEffect(planEffectList, userObj)
      let effectArray = []
      if (gender == 1) {
        effectArray = diffEffectMan(oldUserObj, userObj)
      }else{
        effectArray = diffEffectLady(oldUserObj, userObj)
      }
      useHour(userObj)
      await userPlanDao.save(userPlanData, 'add')
      await userManDao.save(userObj, 'update')

      let resultArray = []
      addResultArray(resultArray, plan.result, false)
      addResultArray(resultArray, '最终:', effectArray)
      data.resultArray = resultArray
    } else {
      let resultArray = []
      addResultArray(resultArray, '钱包那么瘪，如果不想付出劳动获得金钱，就好好宅着吧！', false)
      data.resultArray = resultArray
    }
  }
}
module.exports = UserPlanService