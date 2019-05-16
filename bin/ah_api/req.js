var https = require('https')
var Api = require(appRoot + '/models/api')
var logger = require(appRoot + '/app').logger
var apiAuth = require(appRoot + '/bin/ah_api/auth')

module.exports.apiRequest = function (api, path, callback) {
  //Check if token is not expired
  if (new Date(api.expireAt).getTime() < new Date().getTime()) {
    apiAuth.refreshToken(api.refreshToken, Api.getRedirectUrl(), Api.getSecret(), Api.getClientId(), function (apiData) {

      if (apiData) {
        var apiReg = new Api()
        apiReg.refreshToken = apiData.refresh_token
        apiReg.accessToken = apiData.access_token
        apiReg.id = api.id
        apiReg.SchoolId = api.SchoolId
        logger.info('RefreshToken WATCH THIS 1 : ' + apiData)
        logger.info('RefreshToken WATCH THIS 2 : ' + apiData.access_token)
        apiReg.updateDB(function (err) {
          if (err) {
            logger.info('error on updatedb' + err)
          } else {
            sendApiRequest(apiReg, path, callback)
          }
        })
      } else {
        console.log('!!!!!!!!!!! apiData : ' + apiData)
      }
    })
  } else {
    logger.info('REQ GOODBYE appel')
    sendApiRequest(api, path, callback)
  }
}

function sendApiRequest(api, path, callback) {
  var result = {}
  result.request = {}
  result.result = {}
  path = path.replace('#{ownerId}', api.ownerId)
  var host = api.vpcUrl.replace('https://', '')
  var options = {
    host: host,
    rejectUnauthorized: false,
    port: 443,
    path: path,
    method: 'GET',
    headers: {
      'X-AH-API-CLIENT-SECRET': Api.getSecret(),
      'X-AH-API-CLIENT-ID': Api.getClientId(),
      'X-AH-API-CLIENT-REDIRECT-URI': Api.getRedirectUrl(),
      Authorization: 'Bearer ' + api.accessToken
    }
  }
  logger.info(options)
  result.request.options = options
  var req = https.request(options, function (res) {
    result.result.status = res.statusCode
    logger.info('STATUS: ' + result.result.status)
    result.result.headers = JSON.stringify(res.headers)
    logger.info('HEADERS: ' + result.result.headers)
    res.setEncoding('utf8')
    var data = ''
    res.on('data', function (chunk) {
      data += chunk
    })
    res.on('end', function () {
      if (data != '') {
        var dataJSON = JSON.parse(data)
        result.data = dataJSON.data
        result.error = dataJSON.error
      }
      switch (result.result.status) {
        case 200:
          callback(null, result)
          break
        default:
          logger.error(result)
          callback(result.error, result)
          break
      }
    })
  })
  req.on('error', function (err) {
    callback(err, null)
  })

  // write data to request body
  req.write('data\n')
  req.end()
}
