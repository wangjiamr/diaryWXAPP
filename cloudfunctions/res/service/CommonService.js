const {
  minish,
  attrList,
  formatNumber,
  man,
  currentDay,
  initDays,
  initHours
} = require('../utils/GameUtils.js')
const CommonResponse = require('../entity/CommonResponse.js')
const SettingDao = require('../dao/SettingDao.js')
const JobDao = require('../dao/JobDao.js')
const PlanDao = require('../dao/PlanDao.js')
const CoupleDao = require('../dao/CoupleDao.js')
const LuckDao = require('../dao/LuckDao.js')
const FundDao = require('../dao/FundDao.js')
const CarDao = require('../dao/CarDao.js')
const HouseDao = require('../dao/HouseDao.js')
const ClothesDao = require('../dao/ClothesDao.js')
const LuxuryDao = require('../dao/LuxuryDao.js')
const TipDao = require('../dao/TipDao.js')

const UserDao = require('../dao/UserDao.js')
const UserManDao = require('../dao/UserManDao.js')
const UserLadyDao = require('../dao/UserLadyDao.js')
const UserFundDao = require('../dao/UserFundDao.js')
const UserJobDao = require('../dao/UserJobDao.js')
const UserCoupleDao = require('../dao/UserCoupleDao.js')
const UserCarDao = require('../dao/UserCarDao.js')
const UserHouseDao = require('../dao/UserHouseDao.js')
const UserLimitDao = require('../dao/UserLimitDao.js')


const settingDao = new SettingDao()
const userDao = new UserDao()
const planDao = new PlanDao()
const jobDao = new JobDao()
const coupleDao = new CoupleDao()
const luckDao = new LuckDao()
const fundDao = new FundDao()
const carDao = new CarDao()
const houseDao = new HouseDao()
const clothesDao = new ClothesDao()
const luxuryDao = new LuxuryDao()
const tipDao = new TipDao()

const userManDao = new UserManDao()
const userLadyDao = new UserLadyDao()
const userFundDao = new UserFundDao()
const userJobDao = new UserJobDao()
const userCoupleDao = new UserCoupleDao()
const userCarDao = new UserCarDao()
const userHouseDao = new UserHouseDao()
const userLimitDao = new UserLimitDao()

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
        const jobArray = jobDao.getList(user.gender)
        resolve(jobArray)
      })

      let planGet = new Promise((resolve, reject) => {
        const planArray = planDao.getList(user.gender)
        resolve(planArray)
      })

      let coupleGet = new Promise((resolve, reject) => {
        const coupleArray = coupleDao.getList(user.gender)
        resolve(coupleArray)
      })

      let luckGet = new Promise((resolve, reject) => {
        const luckArray = luckDao.getList()
        resolve(luckArray)
      })

      let fundGet = new Promise((resolve, reject) => {
        const fundArray = fundDao.getList()
        resolve(fundArray)
      })

      let tipGet = new Promise((resolve, reject) => {
        const tipArray = tipDao.getList()
        resolve(tipArray)
      })

      let genderGet1, genderGet2
      if (user.gender == 1) {
        genderGet1 = new Promise((resolve, reject) => {
          const carArray = carDao.getList()
          resolve(carArray)
        })
        genderGet2 = new Promise((resolve, reject) => {
          const houseArray = houseDao.getList()
          resolve(houseArray)
        })
      } else if (user.gender == 2) {
        genderGet1 = new Promise((resolve, reject) => {
          const clothesArray = clothesDao.getList()
          resolve(clothesArray)
        })
        genderGet2 = new Promise((resolve, reject) => {
          const luxuryArray = luxuryDao.getList()
          resolve(luxuryArray)
        })
      }

      await Promise.all([jobGet, planGet, coupleGet, luckGet, fundGet, tipGet, genderGet1, genderGet2]).then((results) => {
        const jobGetResult = results[0]
        const planGetResult = results[1]
        const coupleGetResult = results[2]
        const luckGetResult = results[3]
        const fundGetResult = results[4]
        const tipGetResult = results[5]
        let carGetResult, houseGetResult, clothesGetResult, luxuryGetResult
        if (user.gender == 1) {
          carGetResult = results[6]
          houseGetResult = results[7]
        } else if (user.gender == 2) {
          clothesGetResult = results[6]
          luxuryGetResult = results[7]
        }
        data.jobArray = minish(jobGetResult)
        data.planArray = minish(planGetResult)
        data.coupleArray = minish(coupleGetResult)
        data.luckArray = minish(luckGetResult)
        data.fundArray = minish(fundGetResult)
        data.tipArray = minish(tipGetResult)
        data.carArray = minish(carGetResult)
        data.houseArray = minish(houseGetResult)
        data.clothesArray = minish(clothesGetResult)
        data.luxuryArray = minish(luxuryGetResult)
      }).catch((error) => {
        console.log(error)
      })
    }
    ctx.body = CommonResponse(0, 'success', data)
  }



  async start(ctx, next) {
    const event = ctx._req.event
    let {
      userId
    } = event
    let data = {}
    let result = CommonResponse(-1, 'fail', data)
    const user = await userDao.getUserById(userId)
    if (user) {
      if (user.gender == 1) {
        let userMan = await userManDao.getByUserId(userId)
        if (!userMan) {
          let userManData = {
            _userId: userId,
            health: 100,
            money: 8000,
            ability: 100,
            experience: 100,
            happy: 100,
            positive: 100,
            connections: 100,
            days: initDays(),
            hours: initHours(),
            score: 0
          }
          console.info(userManData)
          const addId = await userManDao.add(userManData)
          if (addId) {
            userMan = await userManDao.getById(addId)
          }
        }

        const updateState = await userDao.incPlayNumber(userId)
        if (updateState > 0) {

          data.userMan = userMan
          await loadUserData(data, userId, user.gender)

          result = CommonResponse(0, 'success', data)
        }
      }
    }
    ctx.body = result
  }


  async init(ctx, next) {
    const event = ctx._req.event
    let data = {}
    let result = CommonResponse(-1, 'fail', data)
    const {
      key
    } = event
    if (key === 'fund') {
      const totalMoney = await userFundDao.getSumByUserId()
      data.totalMoney = totalMoney
    } else if (key === 'job') {
      await jobDao.init()
    } else if (key === 'car') {
      console.info('asass')
      await carDao.init()
    } else if (key === 'house') {
      await houseDao.init()
    } else if (key === 'clothes') {
      await clothesDao.init()
    } else if (key === 'luxury') {
      await luxuryDao.init()
    } else if (key === 'couple') {
      await coupleDao.init()
    } else if (key === 'plan') {
      await planDao.init()
    }



    ctx.body = result
  }
}
/* */
async function loadUserData(data, userId, gender) {
  console.info('*****=' + JSON.stringify(data))
  data.userState = attrList(gender, 1)
  let totalMoneyGet = new Promise((resolve, reject) => {
    const totalMoney = userFundDao.getSumByUserId(userId)
    resolve(totalMoney)
  })

  let userFundGet = new Promise((resolve, reject) => {
    const userFundList = userFundDao.getListByUserId(userId)
    resolve(userFundList)
  })

  let userJobGet = new Promise((resolve, reject) => {
    const userJob = userJobDao.getByUserId(userId)
    resolve(userJob)
  })

  let userCoupleGet = new Promise((resolve, reject) => {
    const userCouple = userCoupleDao.getByUserId(userId)
    resolve(userCouple)
  })

  let live = true

  if (gender == 1) {

    if (data.userMan.health < 0) {
      live = false;
    }

    let userCarGet = new Promise((resolve, reject) => {
      const userCarList = userCarDao.getListByUserId(userId)
      resolve(userCarList)
    })

    let userHouseGet = new Promise((resolve, reject) => {
      const userHouseList = userHouseDao.getListByUserId(userId)
      resolve(userHouseList)
    })

    await Promise.all([totalMoneyGet, userFundGet, userCarGet, userHouseGet, userJobGet, userCoupleGet]).then((results) => {
      const totalMoney = results[0]
      const userFundList = results[1]
      const coupleGetResult = results[2]
      const userCarList = results[3]
      const userHouseList = results[4]
      const userJob = results[5]
      const userCouple = results[6]

      data.fund = formatNumber(totalMoney, 0, true)

      if (userJob) {
        data.myJobId = userJob._id
      }
      if (userCouple) {
        data.myCoupleId = userCouple._id
      }

      let myFundArray = []
      let myFundDiff = {}
      let sumFundBuy = 0
      let sumFundMoney = 0
      let diffFundMoney = 0
      if (userFundList.length > 0) {
        for (let userFund of userFundList) {
          myFundArray.push(userFund._fundId)
          myFundDiff[userFund._fundId] = formatNumber(userFund.money - userFund.buy, 0, true)
          sumFundBuy += userFund.buy
          sumFundMoney += userFund.money
        }
        diffFundMoney = sumFundMoney - sumFundBuy
      }
      data.myFundArray = myFundArray
      data.myFundDiff = myFundDiff
      data.sumFundBuy = sumFundBuy
      data.sumFundMoney = sumFundMoney
      data.diffFundMoney = diffFundMoney



      let myCarArray = []
      let myCarNumber = {}
      if (userCarList.length > 0) {
        let carSetIds = new Set()
        for (let userCar of userCarList) {
          if (!carSetIds.has(userCar._carId)) {
            myCarNumber[userCar._carId] = 1
            myCarArray.push(userCar._carId)
            carSetIds.add(userCar._carId)
          } else {
            let carNumber = myCarNumber[userCar._carId]
            myCarNumber[userCar._carId] = carNumber + 1
          }
        }
      }

      data.myCarArray = myCarArray
      data.myCarNumber = myCarNumber

      let myHouseArray = []
      let myHouseNumber = {}
      if (userHouseList.length > 0) {
        let houseSetIds = new Set()
        for (let userHouse of userHouseList) {
          if (!houseSetIds.has(userHouse._houseId)) {
            myHouseNumber[userHouse._houseId] = 1
            myHouseArray.push(userHouse._houseId)
            houseSetIds.add(userHouse._houseId)
          } else {
            let houseNumber = myHouseNumber[userHouse._houseId]
            myHouseNumber[userHouse._houseId] = houseNumber + 1
          }
        }
      }
      data.myHouseArray = myHouseArray
      data.myHouseNumber = myHouseNumber
    }).catch((error) => {
      console.log(error)
    })

    const userDay = data.userMan.days


    let userJobLimitGet = new Promise((resolve, reject) => {
      const jobLimit = userLimitDao.getCountByUserIdDayAction(userId, userDay, 'JOB')
      resolve(jobLimit)
    })
    let userLuckLimitGet = new Promise((resolve, reject) => {
      const luckLimit = userLimitDao.getCountByUserIdDayAction(userId, userDay, 'LUCK')
      resolve(luckLimit)
    })
    let userHouseLimitGet = new Promise((resolve, reject) => {
      const houseLimit = userLimitDao.getCountByUserIdDayAction(userId, userDay, 'HOUSE')
      resolve(houseLimit)
    })
    let userCarLimitGet = new Promise((resolve, reject) => {
      const carLimit = userLimitDao.getCountByUserIdDayAction(userId, userDay, 'CAR')
      resolve(carLimit)
    })
    let userCoupleLimitGet = new Promise((resolve, reject) => {
      const coupleLimit = userLimitDao.getCountByUserIdDayAction(userId, userDay, 'COUPLE')
      resolve(coupleLimit)
    })
    let userFundLimitGet = new Promise((resolve, reject) => {
      const fundLimit = userLimitDao.getCountByUserIdDayAction(userId, userDay, 'FUND')
      resolve(fundLimit)
    })

    await Promise.all([userJobLimitGet, userLuckLimitGet, userHouseLimitGet, userCarLimitGet, userCoupleLimitGet, userFundLimitGet]).then((results) => {
      const jobLimit = results[0]
      const luckLimit = results[1]
      const houseLimit = results[2]
      const carLimit = results[3]
      const coupleLimit = results[4]
      const fundLimit = results[5]

      let userMan = data.userMan
      man(userMan, jobLimit, luckLimit, houseLimit, carLimit, coupleLimit, fundLimit)

      data.currentDay = currentDay(userDay)
    }).catch((error) => {
      console.log(error)
    })
  }

}
module.exports = CommonService