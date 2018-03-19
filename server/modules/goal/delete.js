/**
 * Created by juwoong on 15. 9. 17..
 */
var mongoose = require('mongoose');
var User = mongoose.model('user');
var Goal = mongoose.model('goal');
var Templete = mongoose.model('reportTemplete');

function* remove(req, res) {
    try {
        var user = yield User.findById(req.params.userId);
        var goal = yield Goal.findById(req.params.goalid);

        if((user&&goal) == null) {
            res.status = 404;
            return {msg : "Goal not found. Maybe it already deleted.."};
        }

        console.log(user.currentGoals);
        for(var i=0; i<user.currentGoals.length; i++) {
            if(req.params.goalid == user.currentGoals[i]) break;
        }
        if(i >= user.currentGoals.length) {
            res.status = 404;
            return {msg : "this goal is not yours."};
        }

        var setQuery = {};
        setQuery['currentGoals.'+i] = 1;
        yield User.update({_id:req.params.userId}, {"$unset" : setQuery});
        yield User.update({_id:req.params.userId}, {"$pull" : {"currentGoals" : null}});
        yield Goal.remove({_id:req.params.goalid});
        yield Templete.remove({userId : req.params.userId, goalId : req.params.goalid});
    } catch(err) {
        log.error('DELETE: /goal/'+req.params.goalid + " " + err);
        log.error(err.stack);
        res.status = 500;
        return {status:500, msg : "Server error"};
    }
    res.status = 204;
    return {status:204};
};

module.exports = remove;