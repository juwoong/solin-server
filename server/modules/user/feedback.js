/**
 * Created by juwoong on 15. 9. 17..
 */
var mongoose = require('mongoose');
var moment = require('moment');
var feed = require('../../models/feedback');
var Feedback = mongoose.model('feedback');

function* getFeed(req){
    if((req.body.type && req.body.message) == null) return setting.status.WRONG_REQUEST;

    try {
        var db = new Feedback({
            type : req.body.type,
            date : moment(),
            userId : req.params.userId,
            question : req.body.message
        });

        yield db.save();
    } catch(e) {
        log.error('POST: /user/me/feedback ' + e);
        log.error(e.stack);
        return setting.status.SERVER_ERROR;
    }

    return {"status" : 200, "msg" : "success", id: db._id};
}

module.exports = getFeed;
