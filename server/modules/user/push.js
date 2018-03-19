/**
 * Created by juwoong on 2015. 8. 30..
 */
var redis = require('redis');
var wrapper = require('co-redis');
var client = wrapper(redis.createClient('6379'));

function* saveGCMRegisrationID(req, res){
    if(req.body.registrationId == null) {
        return setting.status.WRONG_REQUEST;
    }

    try {
        yield client.set(req.params.userId, req.body.registrationId);
    } catch(e) {
        log.error('/user/me/gcm : ' + e);
        log.error(e.stack);
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }

    return {status : 200, msg : "success!"};
}

module.exports.saveGcm = saveGCMRegisrationID;