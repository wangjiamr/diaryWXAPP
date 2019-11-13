exports.gameDays = () => {
  return 7
}
exports.initDays = () => {
  return 6
}
exports.initHours = () => {
  return 6
}
exports.toDecimal = (x) => {
  var f = parseFloat(x)
  if (isNaN(f)) {
    return
  }
  f = Math.round(x * 100) / 100
  return f
}

exports.attrList = (gender, isManage) => {
  var attrArray = []
  if (gender == 1) {
    attrArray.push({
      text: '健康',
      value: isManage == 0 ? "HEALTH" : "HEALTH".toLowerCase()
    })
    attrArray.push({
      text: '现金',
      value: isManage == 0 ? "MONEY" : "MONEY".toLowerCase()
    })
    if (isManage != 0) {
      attrArray.push({
        text: '理财收益',
        value: isManage == 0 ? "FUND" : "FUND".toLowerCase()
      })
    }
    attrArray.push({
      text: '工作能力',
      value: isManage == 0 ? "ABILITY" : "ABILITY".toLowerCase()
    })
    attrArray.push({
      text: '社会经验',
      value: isManage == 0 ? "EXPERIENCE" : "EXPERIENCE".toLowerCase()
    })
    attrArray.push({
      text: '快乐',
      value: isManage == 0 ? "HAPPY" : "HAPPY".toLowerCase()
    })
    attrArray.push({
      text: '正义',
      value: isManage == 0 ? "POSITIVE" : "POSITIVE".toLowerCase()
    })
    attrArray.push({
      text: '人脉',
      value: isManage == 0 ? "CONNECTIONS" : "CONNECTIONS".toLowerCase()
    })
  } else if (gender == 2) {
    attrArray.push({
      text: '健康',
      value: isManage == 0 ? "HEALTH" : "HEALTH".toLowerCase()
    })
    attrArray.push({
      text: '现金',
      value: isManage == 0 ? "MONEY" : "MONEY".toLowerCase()
    })
    if (isManage != 0) {
      attrArray.push({
        text: '理财收益',
        value: isManage == 0 ? "FUND" : "FUND".toLowerCase()
      })
    }
    attrArray.push({
      text: '工作能力',
      value: isManage == 0 ? "ABILITY" : "ABILITY".toLowerCase()
    })
    attrArray.push({
      text: '处世智慧',
      value: isManage == 0 ? "WISDOM" : "WISDOM".toLowerCase()
    })
    attrArray.push({
      text: '快乐',
      value: isManage == 0 ? "HAPPY" : "HAPPY".toLowerCase()
    })
    attrArray.push({
      text: '美貌',
      value: isManage == 0 ? "BEAUTY" : "BEAUTY".toLowerCase()
    })
    attrArray.push({
      text: '知名度',
      value: isManage == 0 ? "POPULARITY" : "POPULARITY".toLowerCase()
    })
  }
  return attrArray
}

exports.minish = (obj) => {
  if (obj) {

    if (obj instanceof Array) {
      let index = 0
      for (let o of obj) {
        delete o["created"]
        delete o["createdBy"]
        delete o["updated"]
        delete o["updatedBy"]
        delete o["useYn"]
        obj[index] = o
        index++
      }
    } else {
      delete obj["created"]
      delete obj["createdBy"]
      delete obj["updated"]
      delete obj["updatedBy"]
      delete obj["useYn"]
    }
  }
}



exports.formatNumber = (num, cent, isThousand) => {
  num = num.toString().replace(/\$|\,/g, '');

  // 检查传入数值为数值类型  
  if (isNaN(num))
    num = "0";

  // 获取符号(正/负数)  
  sign = (num == (num = Math.abs(num)));

  num = Math.floor(num * Math.pow(10, cent) + 0.50000000001); // 把指定的小数位先转换成整数.多余的小数位四舍五入  
  cents = num % Math.pow(10, cent); // 求出小数位数值  
  num = Math.floor(num / Math.pow(10, cent)).toString(); // 求出整数位数值  
  cents = cents.toString(); // 把小数位转换成字符串,以便求小数位长度  

  // 补足小数位到指定的位数  
  while (cents.length < cent)
    cents = "0" + cents;

  if (isThousand) {
    // 对整数部分进行千分位格式化.  
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
      num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
  }

  if (cent > 0)
    return (((sign) ? '' : '-') + num + '.' + cents);
  else
    return (((sign) ? '' : '-') + num);
}

exports.man = (userMan, jobLimit, luckLimit, houseLimit, carLimit, coupleLimit, fundLimit) => {
  if (userMan) {
    userMan['jobLimit'] = jobLimit
    userMan['luckLimit'] = luckLimit
    userMan['houseLimit'] = houseLimit
    userMan['carLimit'] = carLimit
    userMan['coupleLimit'] = coupleLimit
    userMan['fundLimit'] = fundLimit

    exports.minish(userMan)
    userMan['moneyNumber'] = userMan['money']
    userMan['health'] = exports.formatNumber(userMan['health'], 0, true)
    userMan['money'] = exports.formatNumber(userMan['money'], 0, true)
    userMan['ability'] = exports.formatNumber(userMan['ability'], 0, true)
    userMan['experience'] = exports.formatNumber(userMan['experience'], 0, true)
    userMan['happy'] = exports.formatNumber(userMan['happy'], 0, true)
    userMan['positive'] = exports.formatNumber(userMan['positive'], 0, true)
    userMan['connections'] = exports.formatNumber(userMan['connections'], 0, true)
  }
}


exports.lady = (userLady, jobLimit, luckLimit, clothesLimit, luxuryLimit, coupleLimit, fundLimit) => {
  if (userLady) {
    userLady['jobLimit'] = jobLimit
    userLady['luckLimit'] = luckLimit
    userLady['clothesLimit'] = clothesLimit
    userLady['luxuryLimit'] = luxuryLimit
    userLady['coupleLimit'] = coupleLimit
    userLady['fundLimit'] = fundLimit

    exports.minish(userLady)
    userLady['moneyNumber'] = userLady['money']
    userLady['health'] = exports.formatNumber(userLady['health'], 0, true)
    userLady['money'] = exports.formatNumber(userLady['money'], 0, true)
    userLady['ability'] = exports.formatNumber(userLady['ability'], 0, true)
    userLady['wisdom'] = exports.formatNumber(userLady['wisdom'], 0, true)
    userLady['happy'] = exports.formatNumber(userLady['happy'], 0, true)
    userLady['beauty'] = exports.formatNumber(userLady['beauty'], 0, true)
    userLady['popularity'] = exports.formatNumber(userLady['popularity'], 0, true)
  }
}

exports.currentDay = (day) => {
  return exports.gameDays() - day
}

exports.dayText = (day) => {
  let dayText = ''
  let diffDays = exports.gameDays() - day
  switch (diffDays) {
    case 1:
      dayText = "一";
      break;
    case 2:
      dayText = "二";
      break;
    case 3:
      dayText = "三";
      break;
    case 4:
      dayText = "四";
      break;
    case 5:
      dayText = "五";
      break;
    case 6:
      dayText = "六";
      break;
    case 7:
      dayText = "七";
      break;
    case 8:
      dayText = "八";
      break;
    case 9:
      dayText = "九";
      break;
    case 10:
      dayText = "十";
      break;
  }
  return dayText
}
exports.addResultArray = (resultArray, resultText, effectArray) => {
  if (resultArray && resultText != '') {
    let resultItem = {
      text: resultText
    }
    if (effectArray && effectArray.length > 0) {
      resultItem['effectArray'] = effectArray
    }
    resultArray.push(resultItem)
  }
}

exports.requirePass = (requireList, userObj) => {
  let pass = true
  if (requireList && requireList.length > 0) {
    for (let require of requireList) {
      let requireKey = require['attrKey'].toLowerCase()
      if (requireKey) {
        let userValue = userObj[requireKey]
        if (userValue) {
          userValue = parseInt(userValue)
          let requireValue = require['value']
          if (requireValue) {
            requireValue = parseInt(requireValue)
            if (userValue < requireValue) {
              pass = false
              break
            }
          }
        }
      }
    }
  }
  return pass
}

exports.useEffect = (effectList, userObj) => {
  if (effectList && effectList.length > 0) {
    for (let effect of effectList) {
      let attrKey = effect['attrKey'].toLowerCase()
      let operation = effect['operation'].toUpperCase()
      let value = effect['value']
      if (value) {
        value = parseInt(value)
        let effectValue = userObj[attrKey]
        if (effectValue) {
          effectValue = parseInt(effectValue)
          let percent = false
          try {
            percent = effect[percent]
            if (percent) {
              percent = percent.toUpperCase()
            } else {
              percent = 'N'
            }
          } catch (e) {}
          if (percent === 'N') {
            if (operation === 'SUB') {
              effectValue = effectValue - value
            } else if (operation === 'ADD') {
              effectValue = effectValue + value
            }
          } else if (percent === 'N') {
            if (operation === 'SUB') {
              value = 0 - value
            }
            value = 100 + value
            let dyPrice = exports.toDecimal(effectValue * value)
            dyPrice = exports.toDecimal(dyPrice / 100)
            effectValue = parseInt(Math.round(dyPrice))
          }
          userObj[attrKey] = effectValue
        }
      }
    }
  }
}
exports.diffEffectMan = (userManBefore, userManAfter) => {
  let resultEffect = []
  if (userManBefore && userManAfter) {
    let healthB = userManBefore['health']
    let moneyB = userManBefore['money']
    let abilityB = userManBefore['ability']
    let experienceB = userManBefore['experience']
    let happyB = userManBefore['happy']
    let positiveB = userManBefore['positive']
    let connectionsB = userManBefore['connections']

    let healthA = userManAfter['health']
    let moneyA = userManAfter['money']
    let abilityA = userManAfter['ability']
    let experienceA = userManAfter['experience']
    let happyA = userManAfter['happy']
    let positiveA = userManAfter['positive']
    let connectionsA = userManAfter['connections']
    exports.diffValue(resultEffect, healthB, healthA, 1, "health")
    exports.diffValue(resultEffect, moneyB, moneyA, 1, "money")
    exports.diffValue(resultEffect, abilityB, abilityA, 1, "ability")
    exports.diffValue(resultEffect, experienceB, experienceA, 1, "experience")
    exports.diffValue(resultEffect, happyB, happyA, 1, "happy")
    exports.diffValue(resultEffect, positiveB, positiveA, 1, "positive")
    exports.diffValue(resultEffect, connectionsB, connectionsA, 1, "connections")
    return resultEffect
  }
}
exports.diffEffectLady = (userLadyBefore, userLadyAfter) => {
  let resultEffect = []
  if (userLadyBefore && userLadyAfter) {
    let healthB = userLadyBefore['health']
    let moneyB = userLadyBefore['money']
    let abilityB = userLadyBefore['ability']
    let wisdomB = userLadyBefore['wisdom']
    let happyB = userLadyBefore['happy']
    let beautyB = userLadyBefore['beauty']
    let popularityB = userLadyBefore['popularity']

    let healthA = userLadyAfter['health']
    let moneyA = userLadyAfter['money']
    let abilityA = userLadyAfter['ability']
    let wisdomA = userLadyAfter['wisdom']
    let happyA = userLadyAfter['happy']
    let beautyA = userLadyAfter['beauty']
    let popularityA = userLadyAfter['popularity']
    exports.diffValue(resultEffect, healthB, healthA, 0, "health")
    exports.diffValue(resultEffect, moneyB, moneyA, 0, "money")
    exports.diffValue(resultEffect, abilityB, abilityA, 0, "ability")
    exports.diffValue(resultEffect, wisdomB, wisdomA, 0, "wisdom")
    exports.diffValue(resultEffect, happyB, happyA, 0, "happy")
    exports.diffValue(resultEffect, beautyB, beautyA, 0, "beauty")
    exports.diffValue(resultEffect, popularityB, popularityA, 0, "popularity")
    return resultEffect
  }
}

exports.diffValue = (resultEffect, value1, value2, gender, key) => {
  let jsonObject = {}
  if (value1 && value2) {
    if (value1 == value2) {
      return
    } else if (value1 > value2) {
      jsonObject.op = 'sub'
      if (gender == 1) {
        jsonObject.attrName = exports.getAttrNameMan(key)
      } else {
        jsonObject.attrName = exports.getAttrNameLady(key)
      }
      jsonObject.value = '-' + (value1 - value2)

      resultEffect.push(jsonObject)
    } else if (value1 < value2) {
      jsonObject.op = 'add'
      if (gender == 1) {
        jsonObject.attrName = exports.getAttrNameMan(key)
      } else {
        jsonObject.attrName = exports.getAttrNameLady(key)
      }
      jsonObject.value = '+' + (value2 - value1)
      resultEffect.push(jsonObject)
    }
  }
}

exports.failAttrNames = (requireList, userObj, gender) => {
  let failArray = []
  if (requireList && requireList.length > 0) {
    for (let require of requireList) {
      let requireKey = require['attrKey'].toLowerCase()
      if (requireKey) {
        let userValue = userObj[requireKey]
        if (userValue) {
          userValue = parseInt(userValue)
          let requireValue = require['value']
          if (requireValue) {
            requireValue = parseInt(requireValue)
            if (userValue < requireValue) {
              let jsonObject={}
              jsonObject.op='sub'
              if (gender == 1) {
                jsonObject.attrName = exports.getAttrNameMan(requireKey)
              }else{
                jsonObject.attrName = exports.getAttrNameLady(requireKey)
              }
              jsonObject.value = requireValue
              failArray.push(jsonObject)
            }
          }
        }
      }
    }
  }
  return failArray
}
exports.getAttrNameMan = (attrKey) => {
  let attrName = ''
  attrKey = attrKey.toUpperCase()
  switch (attrKey) {
    case "HEALTH":
      attrName = "健康"
      break
    case "MONEY":
      attrName = "现金"
      break
    case "ABILITY":
      attrName = "工作能力"
      break
    case "EXPERIENCE":
      attrName = "社会经验"
      break
    case "HAPPY":
      attrName = "快乐"
      break
    case "POSITIVE":
      attrName = "正气"
      break
    case "CONNECTIONS":
      attrName = "人脉"
      break
    case "CAR":
      attrName = "座驾"
      break
    case "HOUSE":
      attrName = "房产"
      break
  }
  return attrName
}

exports.getAttrNameLady = (attrKey) => {
  let attrName = ''
  attrKey = attrKey.toUpperCase()
  switch (attrKey) {
    case "HEALTH":
      attrName = "健康"
      break
    case "MONEY":
      attrName = "现金"
      break
    case "ABILITY":
      attrName = "工作能力"
      break
    case "WISDOM":
      attrName = "处世智慧"
      break
    case "HAPPY":
      attrName = "快乐"
      break
    case "BEAUTY":
      attrName = "美貌"
      break
    case "POPULARITY":
      attrName = "知名度"
      break
  }
  return attrName
}

exports.useHour = (userObj) => {
  if (userObj) {
    let days = userObj['days']
    let hours = userObj['hours']
    if (days && hours) {
      days = parseInt(days)
      hours = parseInt(hours)
      if (hours > 0) {
        hours = hours - 1
        userObj['hours'] = hours
      }
    }
  }
}
exports.dynamicPrice = (day, price, offset) => {
  offset = offset * exports.currentDay(day)
  offset = 100 + offset
  let dyPrice = exports.toDecimal(price * offset)
  dyPrice = exports.toDecimal(dyPrice / 100)
  return parseInt(Math.round(dyPrice))
}
exports.callName = (gender) => {
  return gender == 2 ? "小姑娘" : "小伙子"
}

exports.lottery = (orignalRates) => {
  if (!orignalRates || orignalRates.length==0){
    return -1
  }
  let size = orignalRates.length

  let sumRate=0.0
  for (let rate of orignalRates) {
    sumRate += rate
  }

  let sortOrignalRates=[]
  let tempSumRate=0
  for (let rate of orignalRates) {
    tempSumRate += rate
    sortOrignalRates.push(tempSumRate / sumRate)
  }

  let nextDouble = Math.random()

  sortOrignalRates.push(nextDouble)
  sortOrignalRates.sort()
  return sortOrignalRates.indexOf(nextDouble)
}

exports.fundMarket = (doubleList, minNum,maxNum) => {
  let point = parseInt(Math.random() * (99-10), 10)+10
  let flagInt = exports.lottery(doubleList)
  let temp = parseInt(Math.random() * (maxNum - minNum), 10) + minNum
  if (flagInt==1){
    temp = temp*-1
  }
  let market=parseFloat(temp+'.'+point)
  return market
}
exports.trade = (doubleList, minNum, maxNum) => {
  let point = parseInt(Math.random() * (99 - 10), 10) + 10
  let flagInt = exports.lottery(doubleList)
  let temp = parseInt(Math.random() * (maxNum - minNum), 10) + minNum
  if (flagInt == 1) {
    temp = temp * -1
  }
  let market = parseFloat(temp + '.' + point)
  return market
}

