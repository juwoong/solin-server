/**
 * Created by juwoong on 15. 9. 17..
 */
/**
 * 뱃지 명 : 초심자의 행운
 * 활성화 조건 : 사용자가 첫 목표를 만들었을 때.
 * 아이템 번호 : 0
 */
var mongoose = require('mongoose');
var gcm = require('../../libs/gcm');
var redis = require('redis');
var wrapper = require('co-redis');
var client = wrapper(redis.createClient('6379'));
var User = mongoose.model('user');
var Goal = mongoose.model('goal');

function* check(userId) {
    user = yield User.findById(userId);

    if(user.currentGoals.length == 1) {
        for(var i=0; i<user.inventory.length; i++) {
            if(user.inventory[i] == "0") return;
        }
        var data = {
            type : 'badge',
            action : 'OPEN_BADGE',
            actionTarget : "0",
            title : "새로운 뱃지를 얻으셨습니다!",
            message : "\"초심자의 행운\" 뱃지를 얻으셨습니다.",
        }

        var gcmkey = yield client.get(userId);

        gcm(gcmkey, data, null, 'solin');

        yield User.update({_id:userId}, {$push : {inventory : "0"}});
    }
}

module.exports = check;
