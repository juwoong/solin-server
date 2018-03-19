"use strict";
var mongoose = require('mongoose');
var rabbit = require('../../libs/rabbit');
var report = require('../../models/report');
var badge = require('../badge');
var User = mongoose.model('user');
var Goal = mongoose.model('goal');
var ResultTemplete = mongoose.model('reportTemplete');
var moment = require('moment');

function hasBody(doc) {
    if(doc.name === undefined || doc.endDate === undefined || doc.category === undefined || doc.target === undefined
        || doc.target.score === undefined || doc.target.type === undefined) {
        return false;
    }
    return true;
}

function* addGoal(req, res) {
    //console.log(req.body);
    if(!hasBody(req.body)) {
        res.status = 400;
        return setting.status.WRONG_REQUEST;
    }

    var userDoc = {
        target : {
            score : req.body.target.score,
            type : req.body.target.type
        },
        startAt : moment().format('YYYY-MM-DD'),
        result : []
    };

    try {
        let res = yield User.findById(req.params.userId).lean();
        console.log(res);
        userDoc.Id = mongoose.Types.ObjectId(res._id);
        userDoc.name = res.name;
        userDoc.profileImage = res.profileImage;
    } catch(e){
        log.error('/user/'+req.params.userId+'/goals : ' + e);
        log.error(e.stack);
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }

    var goalDoc = {
        name : req.body.name,
        startDate : moment().format('YYYY-MM-DD'),
        endDate : moment(req.body.endDate).format('YYYY-MM-DD'),
        category : req.body.category,
        users : [userDoc],
        tags : []
    };

    //Goal의 ObjectId 링크 걸것
    try{
        var db = new Goal(goalDoc);
        let result = yield db.save();
        yield User.update({_id : req.params.userId}, {$pushAll : {currentGoals: [db._id]}}, {upsert : true});

        var reportTemp = new ResultTemplete({
            userId : userDoc.Id,
            goalId : db._id
        });

        yield reportTemp.save()
    } catch(e) {
        log.error('/user/'+req.params.userId+'/goals : ' + e);
        log.error(e.stack);
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }

    rabbit({name : req.body.name, id : db._id});
    yield badge.beginner(req.params.userId);
    console.log(db);
    return {status : "200", "msg" : "success", goal : db._id};
}

function* calcPersentage(endDate, startDate) {
    endDate = moment(endDate);
    startDate = moment(startDate);
    var now = moment(moment().format('YYYY-MM-DD'));

    return Math.round((now.diff(startDate, 'days') / endDate.diff(startDate, 'days'))*100);
}

function* getList(req, res) {
    console.log('getList : ' + req.params.userId);
    var arr = [];
    try {
        let res = yield User.findById(req.params.userId).lean();
        for(let i=0; i<res.currentGoals.length; i++) {
            let goal = yield Goal.findById(res.currentGoals[i]);
            // TODO: 나중에 소셜 구현되고 멀티유저가 되면 그떄 바꾸시오.
            let persent = yield calcPersentage(goal.endDate, goal.users[0].startAt);
            //let persent=0;
		    if(isNaN(persent)) persent = 0;
            //console.log(goal);
            var result = {
                id : goal._id,
                name : goal.name,
                startDate : goal.startDate.getTime(),
                endDate : goal.endDate.getTime(),
                category : goal.category,
                threeLegged : goal.threeLegged,
                tags : goal.tags,
                percent: persent,
                result : goal.result, //이미 정렬되어있음.
                target : {}
            };

            for(var j=0; j<goal.users.length; j++) {
                if(goal.users[j].Id == req.params.userId) {
                    result.target = goal.users[j].target;
                    break;
                }
            }
            arr.push(result);
        }
    } catch(e) {
        log.error('GET: /user/'+req.params.userid+'/goals : ' + e);
        log.error(e.stack);
	    res.status = 500;
        return setting.status.SERVER_ERROR;
    }

    return {status : 200, msg : "success", list : arr};
}

function* getFullOne(req, res) {
    try {
        var goal = yield Goal.findById(req.params.goalid);
    } catch(e) {
        log.error('GET: /goal/'+req.params.goalid+'/full : ' + e);
        log.error(e.stack);
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }

    if(goal == null) {
        res.status = 404;
        return {status : 404, msg : "찾을 수 없습니다."};
    }

    goal.status = 200;
    goal.msg = "Success";

    return goal;
}

function* getOne(req, res) {
    try {
        var goal = yield Goal.findById(req.params.goalid);
    } catch(e) {
        log.error('GET: /goal/'+req.params.goalid+' : ' + e);
        log.error(e.stack);
        res.status=500;
        return setting.status.SERVER_ERROR;
    }

    if(goal == null) {
        res.status=404;
        return {status : 404, msg : "찾을 수 없습니다."};
    }

    var result = {
        name : goal.name,
        startDate : goal.startDate.getTime(),
        endDate : goal.endDate.getTime(),
        category : goal.category,
        threeLegged : goal.threeLegged,
        tags : goal.tags,
        result : goal.result, //이미 정렬되어있음.
        target : {},
        list : []
    };

    for(var j=0; j<goal.users.length; j++) {
        if(goal.users[j].Id == req.params.userId) {
            result.target = goal.users[j].target;
            result.list = goal.users[j].result;
            break;
        }
    }

    console.log(result);

    return result;
}

function* addResult(req, res) {
    if(req.body.percent == null || req.body.result == null) {
        res.status = 400;
        return setting.status.WRONG_REQUEST;
    }

    try {
        var result = {
            date : moment().format('YYYY-MM-DD'),
            percent : req.body.percent,
            result : req.body.result
        };

        var query = {
            _id : req.params.goalid,
            "users.Id" : req.params.userId
        };

        var execResult = yield Goal.update(query, {'$push' : {'users.$.result' : result}});
        if(execResult.nModified == 0) {
            log.error('NOTMODIFIED ERROR : ' + execResult);
            throw new Error('Not modified, maybe goal is not exist');
        }
    } catch(e) {
        log.error('POST: /goal/'+req.params.goalid+' : ' + e);
        log.error(e.stack);
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }

    return {status : 200, msg : "success"};
}

module.exports.add = addGoal;
module.exports.getList = getList;
module.exports.getFullOne = getFullOne;
module.exports.getOne = getOne;
module.exports.addResult = addResult;
