var mongoose = require('mongoose');
var async = require('async');
var request = require('co-request');
var token = require('../token');

var User = mongoose.model("user");

function hasBody(req) {
    var body = req.body;
    if(body.accountType===undefined || body.userId===undefined || body.userAccessToken === undefined) return false;
    return true;
}

function* facebookAuth(doc) {
    while(true) {
        var uri_token = "https://graph.facebook.com/debug_token?input_token=" + doc.userAccessToken +
            "&client_id=" + authInfo.facebook.FACEBOOK_APP_ID +
            "&access_token=" + authInfo.facebook.FACEBOOK_APP_TOKEN +
            "&redirect_uri=http://thedeblur.com:4445";

        //Access token을 이용하여 Facebook user id를 받아온다.
        try {
            var token_result = yield request(uri_token);
            token_result = JSON.parse(token_result.body);
        } catch (e) {
            log.error('/user/auth : ' + e);
            log.error(e.stack);
            continue;
        }
        break;
    }

    //Facebook Debug Token 문제. 옳지 않은 토큰입니다.

    if (token_result.data === undefined) {
        log.error("/user/auth : 옳지 않은 토큰입니다. " + token_result.error);
        return 400;
    }

    //옳은 토큰이나, 유저와 일치하는 토큰이 아님.
    if(token_result.data.user_id != doc.userId) {
        log.error("/user/auth) : 받은 토큰이 유저와 일치하지 않습니다.");
        return 400;
    }

    var uri_info = "https://graph.facebook.com/" + doc.userId +
        "?access_token=" + doc.userAccessToken;
    //User 정보 가져오기
    var user_info = yield request(uri_info);
    user_info = JSON.parse(user_info.body);
    //유저 이름을 가져올 수 없음.
    if(user_info.name===undefined) {
        log.error("/user/auth : 유저 정보를 받아올 수 없습니다.");
        return 500;
    }

    user_info.profileImage = 'https://graph.facebook.com/'+doc.userId+'/picture?type=large';

    return user_info;
}

function* kakaoAuth(doc) {
    var options = { method: 'GET',
        url: 'https://kapi.kakao.com/v1/user/me',
        headers:
        { authorization: 'Bearer ' + doc.userAccessToken,
            'content-type': 'application/json' } };


    try {
        var result = yield request(options);
        result = JSON.parse(result.body);
    } catch(e){
        log.error('/user/auth : (kakao) ' + e);
        log.error(e.stack)
        return 500;
    }

    if(result.properties === undefined) {
        log.error("/user/auth : 토큰이 옳지 않습니다. (kakao)");
        return 400;
    }

    if(result.id != doc.userId) {
        log("/user/auth : 토큰이 유저와 일치하지 않습니다. (kakao)");
        return 400;
    }

    return {name : result.properties.nickname, profileImage : result.properties.profileImage};

}

function* auth(req, res) {
    //필요한 요청값이 다 있는지 확인한다.
    if(!hasBody(req)) {
        res.status = 400;
        return {"status":400, "msg":"Wrong request"};
    }

    var doc = {
        accountType: req.body.accountType,
        userId: req.body.userId,
        userAccessToken: req.body.userAccessToken
    };

    if(doc.accountType == 'facebook') var user_info =  yield facebookAuth(doc);
    else if(doc.accountType == 'kakao') var user_info = yield kakaoAuth(doc);

    if(user_info == 400) {
        res.status = 400;
        return setting.status.WRONG_REQUEST;
    }
    else if(user_info == 500) {
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }
    doc.name = user_info.name;

    try {
        if (doc.accountType == "facebook") var user = {social : {facebookId : doc.userId}};
        else var user = {social : {kakaoId : doc.userId}};
        result = yield User.findOne(user);
    } catch(e) {
        log.error('/user/auth : 데이터를 검색할 수 없습니다. ' + e);
        log.error(e.stack)
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }


    if(result == null) {
        var refreshToken = yield token.refresh.generateToken(doc);
	var userValue = {refreshToken:refreshToken, name:user_info.name, social:user.social, profileImage : user_info.profileImage};
        var userData = new User(userValue);
        doc.userId = userData._id;
        //var refreshToken = yield token.refresh.generateToken(doc);
        try {
            yield userData.save();
        } catch(e) {
            log.error('/user/auth : 데이터를 저장할 수 없습니다. ' + e);
            log.error(e.stack)
            res.status = 500;
            return setting.status.SERVER_ERROR;
        }
        doc._id = userData._id;
    } else if(result.refreshToken == null) {
        var refreshToken = yield token.refresh.generateToken(doc);
	yield User.update({_id : result._id}, {$set : {refreshToken : refreshToken}});
	doc.userId = result._id;
    } else {
        refreshToken = result.refreshToken;
        doc.userId = result._id;
    }

    var accessToken = yield token.access.generateToken(doc);
    console.log(doc);

    return {status : 200, msg : "success", userId : doc.userId, accessToken : accessToken, refreshToken : refreshToken};
}

function* getInformation(req) {
    try {
        var result = yield User.findById(req.params.userId);
    }catch(e) {
        log.error('GET: /user/me : ' + e);
        log.error(e.stack);
    }

    var inv = [];
    for (var i=0; i<result.inventory.length; i++) {
        console.log(result.inventory[i]+'');
        inv.push(result.inventory[i]+'');
    }

    var json = {
        status : 200,
        msg : "success",
        name : result.name,
        userId : result._id,
        profileImage : result.profileImage,
        statusMessage : result.statusMessage,
        currentGoals : result.currentGoals,
        friends : result.friends,
        activities : result.activities,
        inventory : inv
    };

    return json;
}

module.exports = auth;
module.exports.getUser = getInformation;
