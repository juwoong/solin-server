/**
 * Created by juwoong on 15. 9. 14..
 */
'use strict';
var moment = require('moment');
var mongoose = require('mongoose');
var advise = require('./advisor');
var redis = require('redis');
var wrapper = require('co-redis');
var client = wrapper(redis.createClient('6379'));
var Goal = mongoose.model("goal");
var calc = require('../../libs/calculate');

function* collectView(req, res) {
    try {
        var query = {
            "_id": req.params.goalid,
            "users.Id": req.params.userId
        };
        var object = yield Goal.findOne(query).lean();//, {"users.$" : 1});
        var user = object.users[0];
        var list = [];

        //추가하기
        var now = moment(moment().format('YYYY-MM-DD'));
        var duration = now.diff(user.startAt, 'day') >= 7 ? 7 : now.diff(user.startAt, 'day');

        if (moment().hours() < 12) now.add(-1, 'days');
        var loc = now;
        for(var p = user.result.length - 1; p >= 0;) {
            if (loc.diff(user.result[p].date, 'days') == 0) {
                //console.log('user : ' + user.result);
                list.push({
                    percent: user.result[p].percent,
                    date: user.result[p].date.getTime()
                });
                console.log(moment(user.result[p].date).format('YYYYMMDD'));
                p--;
                loc.add(-1, 'days');
                if (now.diff(loc, 'days') >= duration) break;
                continue;
            } else if(loc.diff(user.result[p].date, 'days') < 0) {
                p--;
                continue;
            }
            list.push({
                percent: 0,
                date: loc.valueOf()
            });
            console.log(loc.format('YYYYMMDD'));
            loc.add(-1, 'days');

            if (now.diff(loc, 'days') >= duration) break;
        }

        list = list.reverse();
        //캐싱처리리
        /*var adviceString = yield client.get(req.params.userId+req.params.goalid+":collecting");
        if(adviceString!=null) {
            adviceString = JSON.parse(adviceString);
            //console.log({currentList: list, comment: adviceString.comment, advice: adviceString.advice});
            return {currentList: list, comment: adviceString.comment, advice: adviceString.advice};
        }*/

        //집중단속기간인가?
        now = moment(moment().format('YYYY-MM-DD'));
        //var duration = now.diff(user.startAt, 'day') >= 7 ? 7 : now.diff(user.startAt, 'day');
        var tempData=[];
        tempData.push(user.result);
        var devi = calc.deviation(user.result, duration);
        var aver = calc.average(user.result, duration);
        var cost = calc.limitavg(user.result, duration);
        if ((now.add(-14, 'days')).isBefore(user.startAt, 'day')) {
            var startAt = moment(Date.parse(user.startAt));
            var current = moment(moment().format('YYYY-MM-DD'));
            var diff = current.diff(startAt.format('YYYY-MM-DD'), 'days') + 1;
            //console.log(diff);

            var comment = {
                type: "intensive"
            };
            //첫번째 집중단속기간
            if (diff <= 3) {
                comment.title = "작심삼일 집중단속기간 D-" + ((3 - diff) == 0 ? "DAY" : 3 - diff);
                comment.subtitle = ((3 - diff) == 0 ? "오늘은" : (3 - diff) + "일 뒤에는") + " 뇌의 거부감이 최고조로 달하는 날입니다! 철저하게, 마음을 부여잡고 열심히 해주세요!";
            } else if (diff <= 7) {
                comment.title = "작심삼일너머 첫 고비 집중단속기간 D-" + ((7 - diff) == 0 ? "DAY" : 7 - diff);
                comment.subtitle = ((7 - diff) == 0 ? "오늘은" : (7 - diff) + "일 뒤에는") + " 사용자님이 목표를 시작하신지 일주일이 되는 날입니다. 작심삼일 이후 찾아오는 첫번째 고비에 대비하세요!";
            } else {
                comment.title = "마지막 고비 집중단속기간 D-" + ((14 - diff) == 0 ? "DAY" : 14 - diff);
                comment.subtitle = ((14 - diff) == 0 ? "오늘은" : (14 - diff) + "일 뒤에는") + " 목표단계의 맨 마지막 고비가 오는 날입니다! 이제 끝입니다. 마지막까지 최선을 다해주세요!"
            }
        } else {
            //표편 높고 평균 높다?
            //표편 높은데 평균 낮다?
            //평균 높은데?
            var comment = {
                type: "normal",
                title: "열심히 하고 계시죠?",
                subtitle: "Solin이, 여러분들의 목표를 응원합니다!"
            };
        }


        //어드바이징 추가리스트
        var advisingTemplete = yield advise.gethyde(user.Id, user);
        var advisingStatus = yield advise.getstatus(devi, aver, cost);
        if (advisingStatus != null) advisingTemplete = advisingTemplete.concat(advisingStatus);
        var advising = [];//result
        var length = (advisingTemplete.length > 4 ? Math.floor(Math.random() * 3) + 2 : 2);
        var key;

        for (var i = 0; i < length;) {
            key = Math.floor(Math.random() * advisingTemplete.length);
            for (var j = 0; j < advising.length; j++) {
                if (advising[j].title == advisingTemplete[key].title) {
                    j = -1;
                    break;
                }
            }
            if (j == -1) continue;
            advising.push(advisingTemplete[key]);
            i++;
        }

        var leftTime = moment(moment().add(1, 'days').format('YYYY-MM-DD')).diff(moment(), 'second');
        var adviceString = JSON.stringify({
            comment : comment,
            advice : advising
        });

        yield client.set(req.params.userId+req.params.goalid+":collecting", adviceString);
        yield client.expire(req.params.userId+req.params.goalid+":collecting", leftTime);
        return {currentList: list, comment: comment, advice: advising};
        //}
    } catch(e) {
        log.error('/goal/'+req.params.goalid+'/collect ' + e);
	    log.error(e.stack);
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }
}
module.exports=collectView;
