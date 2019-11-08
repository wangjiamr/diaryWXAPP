module.exports = function CommonResponse(errorCode,errorMsg,data){
  return{
    errorCode,
    errorMsg,
    data
  }
}