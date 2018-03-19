/**
 * Created by juwoong on 2015. 8. 23..
 */
var request = require('co-request');
var mongoose = require('mongoose');
var User = mongoose.model("user");


function* analyze(req) {
    if(req.body.words == null) return setting.status.WRONG_REQUEST;
    var resultstr = "";

    for(var i=0; i<req.body.words.length; i++) {
        resultstr += req.body.words[i];
    }

    try {
        var result = yield request.post('http://hyde-eng.in/analyze', {form:{result:resultstr}});
        result = JSON.parse(result.body)//result = JSON.parse(result);
        var updateInfo = {result:result.result, words : req.body.words};
        yield User.update({_id : req.params.userId}, {$set : {personality:updateInfo}});
    }catch(e) {
        log.error('POST: /user/me/analyze : ' + e);
        log.error(e.stack);
        return setting.status.SERVER_ERROR;
    }

    return {status : 200, msg : "Success!"};
}

function* get(req) {
    try {
        var user = yield User.findById(req.params.userId).lean();
        if(user.personality == null) return {words:[]};
        return {words:user.personality.words};
    } catch(e) {
        log.error('GET: /user/me/analyze : ' + e);
        log.error(e.stack);
        return setting.status.SERVER_ERROR;
    }
}
module.exports = analyze;
module.exports.get = get;