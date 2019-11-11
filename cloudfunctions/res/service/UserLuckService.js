const {
  minish,
  formatNumber,
  addResultArray,
  useEffect,
  diffEffectMan,
  diffEffectLady,
  toDecimal, lottery, callName
} = require('../utils/GameUtils.js')
const CommonResponse = require('../utils/CommonResponse.js')
const LuckDao = require('../dao/LuckDao.js')


const UserManDao = require('../dao/UserManDao.js')
const UserLadyDao = require('../dao/UserLadyDao.js')
const UserLuckDao = require('../dao/UserLuckDao.js')
const UserLimitDao = require('../dao/UserLimitDao.js')


const luckDao = new LuckDao()

const userManDao = new UserManDao()
const userLadyDao = new UserLadyDao()
const userLuckDao = new UserLuckDao()
const userLimitDao = new UserLimitDao()

class UserLuckService {

  constructor() {}

  async applyLuck(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      luckId,
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

    let luckGet = new Promise((resolve, reject) => {
      const luck = luckDao.getById(luckId)
      resolve(luck)
    })


    let userLuckLimitGet = new Promise((resolve, reject) => {
      const luckLimit = userLimitDao.getCountByUserIdDayAction(userId, userObj.days, 'LUCK')
      resolve(luckLimit)
    })

    let luckGetResult = {},
      userLuckLimitGetResult = {}
    await Promise.all([luckGet, userLuckLimitGet]).then((results) => {
      luckGetResult = results[0]
      userLuckLimitGetResult = results[1]
    }).catch((error) => {
      console.log(error)
    })
    await proccess(userId,
      luckId,
      gender, luckGetResult, userLuckLimitGetResult, userObj, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }
}
async function proccess(userId,
  luckId,
  gender, luckGetResult, userLuckLimitGetResult, userObj, data) {

  let haveMoney = userObj['money']
  let requireMoney = luckGetResult.investPrice
  let gainPrice = luckGetResult.gainPrice
  haveMoney = parseInt(haveMoney)
  requireMoney = parseInt(requireMoney)
  gainPrice = parseInt(gainPrice)

  let luckLimitData = {}
  luckLimitData._userId = userId
  luckLimitData.action = 'LUCK'
  luckLimitData.day = userObj.days

  if (userLuckLimitGetResult == 0 && (haveMoney >= requireMoney)) {

    
    let userLuckData = {}
    userLuckData._userId = userId
    userLuckData._luckId = luckId
    userLuckData.day = userObj.days

    let doubleList=[]
    doubleList.push(luckGetResult.probability)
    doubleList.push(toDecimal(1-luckGetResult.probability))

    let status = lottery(doubleList)
    userLuckData.status = status


    let oldUserObj = Object.assign({}, userObj)
    if(status==0){
      userObj['money'] = haveMoney + gainPrice
    }else {
      userObj['money'] = haveMoney - requireMoney
    }
    if (gender == 1) {
      effectArray = diffEffectMan(oldUserObj, userObj)
      await userManDao.save(userObj, 'update')
    } else {
      effectArray = diffEffectLady(oldUserObj, userObj)
      await userLadyDao.save(userObj, 'update')
    }
    await userLuckDao.save(userLuckData, 'add')
    await userLimitDao.save(luckLimitData, 'add')

    let resultArray = []
    if (status == 0) {
      addResultArray(resultArray, '哎哟喂！' + callName(gender) +'，运气不错，这可是平日行善积德的回报。', false)
      addResultArray(resultArray, '最终:', effectArray)
    }else{
      if (gender == 1) {
        addResultArray(resultArray, '哎！' + callName(gender) + '，运气太差，平日要扶老奶奶过马路，听女朋友的话，孝敬父母。', false)
      }else{
        addResultArray(resultArray, '哎！' + callName(gender) + '，运气太差，平日要给老爷爷让座，爱护小动物，孝敬父母。', false)
      }
      addResultArray(resultArray, '最终:', effectArray)
    }
    data.resultArray = resultArray
  } else {
    let resultArray = []
    if (userLuckLimitGetResult == 0){
      await userLimitDao.save(luckLimitData, 'add')
    }
    if (userLuckLimitGetResult == 1) {
      addResultArray(resultArray, '抱歉，每日只能试一次手气!', false)
    }else{
      addResultArray(resultArray, '凡事都需要有本钱，哪有空手套白狼的!', false)
    }
    data.resultArray = resultArray
  }
}

module.exports = UserLuckService