/**
 * Created by juwoong on 15. 9. 20..
 */
'use strict';
var mongoose = require('mongoose');
var Goal = mongoose.model('goal');
var User = mongoose.model('user');
var Templete = mongoose.model('reportTemplete');
var moment = require('moment');

//총 코멘팅 글을 결과값에 따라 리턴함.
function getTotalComment(value, startDate, endDate) {
    startDate = moment(startDate), endDate = moment(endDate);
    var main = ["아쉬운 실패", "긴 마라톤의 완주", "완벽한 개과천선!"];
    var sub = ["일간 목표를 수행하셨지만 실패하셨습니다.", "일간 목표를 꾸준히 수행하여 오늘 목표가 종료되었습니다.", "일간 열심히 노력하신 결과, 높은 수행률로 목표달성에 성공하셨습니다!"];

    return {
        main : main[value-1],
        sub : (endDate.diff(startDate, 'days')+1) + sub[value-1]
    };
}

//매주 리스트를 계산해서 보냅니다.
function calculateAllList(list, startDate, endDate){
    startDate = moment(startDate), endDate = moment(endDate);
    var result = [];
    var p = 0;

    //매주 리스트를 추가합니다.ㅎㅎ 이거 좀 개쩌는듯
    for(var i = moment(startDate.format('YYYY-MM-DD')); i.diff(endDate, 'days') <= 0; i.add(1, 'days')) {
        if(result[parseInt(i.diff(startDate,'days')/7)] == null) result.push(0);

        if(i.diff(list[p].date, 'days') == 0) {
            result[parseInt(i.diff(startDate, 'days') / 7)] += list[p++].percent;
        }
    }

    //각 주의 평균을 냅니다.
    for(i=0; i<result.length; i++) {
        if(i >= result.length-1) {
            let lastWeekDay = (endDate.diff(startDate, 'days')+1)%7
            result[i] /= (lastWeekDay==0 ? 7 : lastWeekDay);
            continue;
        }

        result[i] /= 7;
    }
    return 0;
}

function createDayList(list) {
    var result = [];
    for(i in list) {
        result.push(i+1);
    }
    return result;
}


//1~7까지의 총점을 계산합니다.
function calculateTotalScore(list, startDate, endDate){
    startDate = moment(startDate), endDate = moment(endDate);
    var val = 0;
    for(let i of list) {
        val += (i>100?100:i);
    }

    val = Math.floor(val / (endDate.diff(startDate, 'days')+1));

    if(val < 20) {
        return 1;
    } else if (val < 80) {
        return 2;
    } else {
        return 3;
    }
}

//지속성 점수
function calculateContinuousScore(list, startDate, endDate){
    startDate = moment(startDate), endDate = moment(endDate);
    var val = 0, devation = 0, p=0;
    for(let i of list) {
        val += i;
    }

    val = Math.floor(val / (endDate.diff(startDate, 'days')+1));
    for(var i = moment(startDate.format('YYYY-MM-DD')); i.diff(endDate, 'days') <= 0; i.add(1, 'days')) {
        if(i.diff(list[p].date, 'days') == 0) {
            devation += Math.pow(val - list[p++].result, 2);
        } else {
            devation += Math.pow(val, 2);
        }
    }

    devation = Math.sqrt(devation / (endDate.diff(startDate, 'days')+1));

    return ((50-(devation>50?50:devation))/50)*100;
}

//평균
function getAverage(list, startDate, endDate) {
    startDate = moment(startDate), endDate = moment(endDate);
    var sum = 0;

    for(var i of list)
        sum += i.percent;

    return sum / (endDate.diff(startDate,'days')+1);
}

//총량
function getAmount(list, standards) {
    var sum = 0;

    for(var i of list)
        sum += ((i.percent/100)*standards);

    return sum;
}

//실패확률
function getFailList(list) {
    var result = [0,0,0,0];

    for(i of list){
        if(i.result == 0) continue;

        result[i.result-1]++;
    }

    return result;
}

function getEndurance(list, startDate, endDate) {
    var contiScore = calculateContinuousScore(list, startDate, endDate);
    var totalScore = calculateTotalScore(list, startDate, endDate);
    var average = getAverage(list, startDate, endDate);

    var main, sub;

    if(contiScore > 85 && average > 100) {
        main = "의지의 차이";
        sub = "꾸준하게, 많이 수행하셨습니다.\n의지의 차이가 목표 성공을 만들었네요!";
    } else if (contiScore > 85 && totalScore > 2) {
        main = "일직선 긋기";
        sub = "꾸준히 정하신 만큼 목표를 수행하셨습니다.\n열심히 하셨네요!";
    } else if (contiScore > 85 && average < 10) {
        main = "일정하긴 한데..";
        sub = "정말 꾸준히 안하셨네요..\n슬픕니다 :("
    } else if (contiScore < 30 && totalScore <= 2) {
        main = "벼랑위에서의 춤사위";
        sub = "목표 기간 내내 불안정한 모습을 보였습니다.\n다음 목표는 좀 더 열심히!"
    } else {
        main = "비틀비틀 걸어가는 나의 다리";
        sub = "오늘도 의미 없는 또하루가 흘러가죠~\n열심히 하셨는데 아쉽네요.."
    }

    return {
        main : main,
        sub : sub,
        percent : score,
    };
}

function* farewell(req, res) {
    try {
        //TODO: 소셜기능이 추가되면, 유저ID에 맞게 임베딩된 UserInGoal Object를 찾는 것 구현.
        var goal = Goal.findById(req.params.goalid);
        var user = goal.users[0];
        var result = {};
        var sum = 0;

        result.name = goal.name +'가\n모두 종료되었습니다.';
        result.result = calculateAllList(user.result, user.startAt, goal.endDate);
        result.days = createDayList(result.result);
        result.total = calculateTotalScore(user.result, user.startAt, goal.endDate);
        result.totalComment = getTotalComment(result.total, user.startAt, goal.endDate);
        result.average = getAverage(user.result, user.startAt, goal.endDate);
        result.count = getAmount(user.result, user.target.score);
        result.fail = getFailList(user.result);

        for (i of result.fail)
            sum += i;

        result.failcount = sum;
        result.endurance = getEndurance(user.result, user.startAt, goal.endDate);

        var query = {
            _id : req.params.goalid,
            "users.Id" : req.params.userId
        };

        yield Goal.update(query, {'$set' : {'users.$.farewell' : result}});

        //After create result, Database
        var userDocument = User.findById(req.params.userId);
        for(var i=0; i<user.currentGoals.length; i++) {
            if(req.params.goalid == user.currentGoals[i]) break;
        }

        var setQuery = {};
        setQuery['currentGoals.'+i] = 1;
        yield User.update({_id:req.params.userId}, {"$unset" : setQuery});
        yield User.update({_id:req.params.userId}, {"$pull" : {"currentGoals" : null}});
        yield User.update({_id:req.params.userId}, {"$push" : {"completeGoals" : goal._id}});

        return result;
    } catch(error) {
        log.error('GET /goal/'+req.params.goalid+'/farewell : ' + error);
        log.error(error.stack);
        res.status = 500;
        return {'msg' : 'Server Error'};
    }
}

module.exports = farewell;