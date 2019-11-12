const {
  minish,
  formatNumber,
  addResultArray,
  requirePass,
  useEffect,
  diffEffectMan,
  diffEffectLady,
  dynamicPrice
} = require('../utils/GameUtils.js')
const CommonResponse = require('../utils/CommonResponse.js')
const CarDao = require('../dao/CarDao.js')


const UserManDao = require('../dao/UserManDao.js')
const UserLadyDao = require('../dao/UserLadyDao.js')
const UserCarDao = require('../dao/UserCarDao.js')
const UserLimitDao = require('../dao/UserLimitDao.js')


const carDao = new CarDao()

const userManDao = new UserManDao()
const userLadyDao = new UserLadyDao()
const userCarDao = new UserCarDao()
const userLimitDao = new UserLimitDao()

class UserCarService {

  constructor() {}

  async buyCar(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      carId,
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

    let carGet = new Promise((resolve, reject) => {
      const car = carDao.getById(carId)
      resolve(car)
    })

    let carEffectGet = new Promise((resolve, reject) => {
      const carEffectList = carDao.getEffectListByCarId(carId)
      resolve(carEffectList)
    })

    let userCarLimitGet = new Promise((resolve, reject) => {
      const carLimit = userLimitDao.getCountByUserIdDayAction(userId, userObj.days, 'CAR')
      resolve(carLimit)
    })

    let carGetResult = {},
      carEffectGetResult = [],
      userCarLimitGetResult = {}
    await Promise.all([carGet, carEffectGet, userCarLimitGet]).then((results) => {
      carGetResult = results[0]
      carEffectGetResult = results[1]
      userCarLimitGetResult = results[2]
    }).catch((error) => {
      console.log(error)
    })
    await buyProccess(userId,
      carId,
      gender, carGetResult, carEffectGetResult, userCarLimitGetResult, userObj, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }

  async sellCar(ctx, next) {
    const event = ctx._req.event
    let {
      userId,
      carId,
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

    let carGet = new Promise((resolve, reject) => {
      const car = carDao.getById(carId)
      resolve(car)
    })

    let userCarGet = new Promise((resolve, reject) => {
      const userCarList = userCarDao.getListByUserIdCarId(userId, carId)
      resolve(userCarList)
    })

    let userCarLimitGet = new Promise((resolve, reject) => {
      const carLimit = userLimitDao.getCountByUserIdDayAction(userId, userObj.days, 'CAR')
      resolve(carLimit)
    })

    let carGetResult = {},
      userCarGetResult = {},
      userCarLimitGetResult = {}
    await Promise.all([carGet, userCarGet, userCarLimitGet]).then((results) => {
      carGetResult = results[0]
      userCarGetResult = results[1]
      userCarLimitGetResult = results[2]
    }).catch((error) => {
      console.log(error)
    })
    await sellProccess(userId,
      carId,
      gender, carGetResult, userCarGetResult, userCarLimitGetResult, userObj, data)

    result = CommonResponse(0, 'success', data)
    ctx.body = result
  }
}
async function buyProccess(userId,
  carId,
  gender, carGetResult, carEffectGetResult, userCarLimitGetResult, userObj, data) {
  if (userCarLimitGetResult == 0) {
    let currentBuyPrice = dynamicPrice(userObj.days, carGetResult.buyPrice, carGetResult.offsetBuy)
    let haveMoney = userObj['money']
    haveMoney = parseInt(haveMoney)
    if (haveMoney >= currentBuyPrice) {
      let carLimitData = {}
      carLimitData._userId = userId
      carLimitData.action = 'CAR'
      carLimitData.day = userObj.days

      let userCarData = {}
      userCarData._userId = userId
      userCarData._carId = carId

      let oldUserObj = Object.assign({}, userObj)

      userObj['money'] = haveMoney - currentBuyPrice

      useEffect(carEffectGetResult, userObj)

    

      if (gender == 1) {
        effectArray = diffEffectMan(oldUserObj, userObj)
        await userManDao.save(userObj, 'update')
      } else {
        effectArray = diffEffectLady(oldUserObj, userObj)
        await userLadyDao.save(userObj, 'update')
      }
      await userCarDao.save(userCarData, 'add')
      await userLimitDao.save(carLimitData, 'add')

      let resultArray = []
      addResultArray(resultArray, '恭喜你,阔气！喜提:' + carGetResult.title, false)
      addResultArray(resultArray, '最终:', effectArray)
      data.resultArray = resultArray
    } else {
      let resultArray = []
      addResultArray(resultArray, '有梦想是好的，但是现实也需要真金白银！', false)
      data.resultArray = resultArray
    }
  } else {
    let resultArray = []
    addResultArray(resultArray, '抱歉，每日只能进行一次买卖车辆', false)
    data.resultArray = resultArray
  }
}

async function sellProccess(userId,
  carId,
  gender, carGetResult, userCarGetResult, userCarLimitGetResult, userObj, data) {
  if (userCarLimitGetResult == 0) {
    let currentSellPrice = dynamicPrice(userObj.days, carGetResult.sellPrice, carGetResult.offsetSell)
    let haveMoney = userObj['money']
    haveMoney = parseInt(haveMoney)

    let carLimitData = {}
    carLimitData._userId = userId
    carLimitData.action = 'CAR'
    carLimitData.day = userObj.days

    let sellUserCarId = userCarGetResult[0]._id


    let oldUserObj = Object.assign({}, userObj)

    userObj['money'] = haveMoney + currentSellPrice

   

    if (gender == 1) {
      effectArray = diffEffectMan(oldUserObj, userObj)
      await userManDao.save(userObj, 'update')
    } else {
      effectArray = diffEffectLady(oldUserObj, userObj)
      await userLadyDao.save(userObj, 'update')
    }
    await userCarDao.deleteById(sellUserCarId)
    await userLimitDao.save(carLimitData, 'add')

    let resultArray = []
    addResultArray(resultArray, '成功出售车辆:' + carGetResult.title, false)
    addResultArray(resultArray, '最终:', effectArray)
    data.resultArray = resultArray
  } else {
    let resultArray = []
    addResultArray(resultArray, '抱歉，每日只能进行一次买卖车辆', false)
    data.resultArray = resultArray
  }
}
module.exports = UserCarService