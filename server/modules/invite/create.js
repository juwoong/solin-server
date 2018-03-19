var encrypt = require('../../libs/encrypt');
var instauuid = require('instauuid');
var redis = require('redis');
var wrapper = require('co-redis');
var client = wrapper(redis.createClient('6379'));
var jwt = require('jwt-simple');

function* createInvite(req){
    var body = {
        userId: req.params.userId
    };

    //goalId가 없으면 단순 초대 링크를 만든다.
    if(req.body.goalId) body.goalId = req.body.goalId;

    var uuid = instauuid();
    // var encode = jwt.encode(body, uuid);

    try {
        yield client.multi()
            .set(uuid, body)
            .expire(uuid, 259200)
            .exec();

    } catch(e) {
        log.error('/invite : ' + e);
        return setting.status.SERVER_ERROR;
    }

    return {inviteurl : setting.endpoint + "inv/" + uuid};
}

module.exports = createInvite;