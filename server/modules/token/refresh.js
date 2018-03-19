var access = require('./access');
//var encrypt = require('../../libs/encrypt');
var moment = require('moment');
var mongoose = require('mongoose');
var models = require('../../models');
var redis = require('redis');
var wrapper = require('co-redis');
var client = wrapper(redis.createClient('6379'));


var user = mongoose.model('user');

function hasBody(req) {
    var body = req.body;
    if(body.refreshToken===undefined) return false;
    return true;
}

function* generateRefreshToken(doc) {
    token = encrypt(doc.userId + doc.userAccessToken);
    token = encrypt(token + moment().valueOf());
    return token;
}

function* verifyRefreshToken(req) {
    //필요한 요청값이 다 있는지 확인한다.
    if(!hasBody(req)) {
        return {"status":400, "msg":"Wrong request"};
    }

    var verify = yield access.decodeToken(req.header.accesstoken);
    if(verify==401) return {code : verify, msg : "Wrong Token"};

    try {
        var info = yield user.findById(verify).lean();
    } catch(e) {
        log.error('POST: /user/me/refresh : ' + e);
        log.error(e.stack);
        return setting.status.SERVER_ERROR;
    }

    /*if(info.refreshToken != req.body.refreshToken) {
        return {status : 401, msg : "wrong refreshToken"};
    }*/

    var accessToken = yield access.generateToken(info);
    return {status:200, msg:"Success", accessToken : accessToken};
}

module.exports.verifyToken = verifyRefreshToken;
module.exports.generateToken = generateRefreshToken;
