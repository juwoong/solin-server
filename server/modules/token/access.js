//var encrypt = require('./../../libs/encrypt');
var jwt = require('jwt-simple');
var async = require('async');
var redis = require('redis');
var wrapper = require('co-redis');
var moment = require('moment');
var client = wrapper(redis.createClient('6379'));

function* verifyAccessToken(token) {
    var key = yield client.get(token);
    console.log(key);
    if(key == null) return 401;

    json = jwt.decode(token, key);
    /*if(moment().valueOf() > json.expireTime) {
        return 403;
    }*/
    
    console.log('verify token : ' + JSON.stringify(json));
    return json.userId;
}

function* generateAccessToken(doc) {
    var key = encrypt(moment().valueOf() + 'token');

    var json = {
        expireTime : moment().add(1, 'days').valueOf(),
        userId : doc.userId,
    };

    token = jwt.encode(json, key);

    var res = yield client.set(token, key);
    //yield client.expire(token, 86400); //엑세스 토큰은 하루 갑니다.
    return token;
}

function* decodeAccessToken(token) {
    var key = yield client.get(token);
    if(key == null) return 401;

    json = jwt.decode(token, key);
    return json;
}

module.exports.generateToken = generateAccessToken;
module.exports.verifyToken = verifyAccessToken;
module.exports.decodeToken = decodeAccessToken;
