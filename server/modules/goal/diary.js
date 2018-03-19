/**
 * Created by juwoong on 15. 9. 20..
 */
var mongoose = require('mongoose');
var moment = require('moment');
var Diary = mongoose.model('diary');
var Goal = mongoose.model('goal');

function* addDiary(req, res){
    if(req.body.content==null) {
        res.status = 400;
        return setting.status.WRONG_REQUEST;
    }
    try {
        var diary = new Diary({
            userId : req.params.userId,
            goalId : req.params.goalid,
            content : req.body.content,
            date : moment().format('YYYY-MM-DD')
        });

        yield diary.save();

        var query = {
            _id : req.params.goalid,
            "users.Id" : req.params.userId
        };

        var execResult = yield Goal.update(query, {"$push" : {"users.$.diaries" : diary._id}});
        if(execResult.nModified == 0) throw new Error('Not modified, maybe goal is not exist');
    }catch(e){
        log.error('POST: /goal/'+req.params.goalid+'/diary '+ e);
        log.error(e.stack);
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }
    return {id : diary._id};
}

module.exports=addDiary;