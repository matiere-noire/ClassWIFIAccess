var https = require('https');
var Api = require(appRoot + '/models/api');
var logger = require(appRoot + "/app").logger;
var apiAuth = require(appRoot + "/bin/ah_api/auth");


module.exports.apiRequest = function (api, path, callback) {

    //Check if token is not expired
    if( new Date(apiFromDB.expireAt).getTime() <= new Date().getTime() ){
        apiAuth.refreshToken( 
            api.refreshToken, 
            Api.getRedirectUrl(), 
            Api.getSecret(), 
            Api.getClientId(), 
            function (apiDataString) {
                if (apiDataString) {
                    var apiDataJSON = JSON.parse(apiDataString);
                    if (apiDataJSON.hasOwnProperty("data")) {
                        var apiReg = new Api.ApiSerializer(apiDataJSON.data);
                        apiReg.id = api.id;
                        apiReg.SchoolId = api.SchoolId;
                        apiReg.updateDB(function (err) {
                            if (err) {
                                Error.render(err);
                            } else {
                                sendApiRequest(apiReg, path, callback);
                            }
                        });
                    } else if (apiDataJSON.hasOwnProperty('error')) {
                        var apiError = new Api.ApiErrorSerializer(apiDataJSON.error);
                        Error.render(apiError);
                    }
                } else {
                    Error.render(err);
                }
        });
    }else{
        sendApiRequest(api, path, callback);
    }
};

function sendApiRequest(api, path, callback){
    var result = {};
    result.request = {};
    result.result = {};
    path = path.replace('#{ownerId}', api.ownerId);
    var host = api.vpcUrl.replace('https://', "");
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
            'Authorization': "Bearer " + api.accessToken
        }
    };
    logger.info(options);
    result.request.options = options;
    var req = https.request(options, function (res) {
        result.result.status = res.statusCode;
        logger.info('STATUS: ' + result.result.status);
        result.result.headers = JSON.stringify(res.headers);
        logger.info('HEADERS: ' + result.result.headers);
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            if (data != '') {
                var dataJSON = JSON.parse(data);
                result.data = dataJSON.data;
                result.error = dataJSON.error;
            }
            switch (result.result.status) {
                case 200:
                    callback(null, result);
                    break;
                default:
                    logger.error(result);
                    callback(result.error, result);
                    break;

            }
        });
    });
    req.on('error', function (err) {
        callback(err, null);
    });


    // write data to request body
    req.write('data\n');
    req.end();
}
