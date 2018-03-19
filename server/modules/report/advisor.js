/**
 * Created by juwoong on 15. 9. 16..
 */
'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('user');

function* gethydeadvice(userid, usergoal) {
    var user = yield User.findById(userid);

    console.log(user);

    var res = [{
        icon : "power_up",
        title: "목표를 이룬후 변화할 나를 상상해보세요",
        subtitle : "어떤 목표를 달성하고 바뀐 나를 상상하는것만큼 설레는건 없죠.  되고 싶은 나를 상상하고 이뤄내기 위해 노력해보세요."
    }, {
        icon : "check",
        title: "주변 사람들에게 " + user.name + "님이 한만큼을 점검 받으세요",
        subtitle : "내가 나에 대해서는 주관적이 될 수밖에 없습니다.  주변 사람들에게 진행중인 목표를 수시로 점검받으시면 어떨까요?"
    }, {
        icon : "write",
        title: "그 어떤 것이든 기록을 수시로 해보세요.",
        subtitle : "오늘 내가 얼마나 했는지, 어떤 방법들을 시도했는지 등을 수시로 공책같은 곳에 기록해두세요. 솔린도 괜찮고요!"
    }];

    if(user.personality.result == null) return res;

    var hyde = {
        o : user.personality.result[0]*1,
        c : user.personality.result[1]*1,
        e : user.personality.result[2]*1,
        a : user.personality.result[3]*1,
        n : user.personality.result[4]*1
    };

    //Hyde part
    if(hyde.e > 3) {
        //Hyde E 3 초과 or 어드바이징이 효과가 없음.
        res.push({
            icon : "friends",
            title: "혼자가 힘들다면, 친구와 같이 해보는건 어때요?",
            subtitle : "주변 친구와 같이 목표를 이뤄나가보시는것도 괜찮을것 같아요. 그러면 더 재밌고 뜻깊은 목표가 되지 않을까요?"
        });
    }
    if(hyde.n > 3) {
        res.push({
            icon : "positive_thinking",
            title: "매사에 긍정적인 생각을 가지세요.",
            subtitle: "긍정적인 생각이 주변마저 적극적이고 긍정적으로 바꾼다는 말처럼, 긍정적이 되려고 노력해본다면 목표에도 좋을것 같아요."
        });
    }
    if(hyde.n >= 3) {
        res.push({
            icon : "no_temptation",
            title:"서서히 올라오는 충동들을 절제할줄 아셔야 해요.",
            subtitle: user.name +"님은 주변의 유혹과 충동에 자주 휩쓸리실지도 몰라요. 충동과 유혹들을 참으려고 노력해주세요."
        });
    }
    if(hyde.c <= 3) {
        res.push({
            icon : "start_now",
            title:"지금 미루면 아무것도 시작되지 않아요.",
            subtitle:'“귀찮다", "나중에 해야지" 라는 생각으로는 아무것도 할 수 없어요. 마음을 먹은 지금, 바로 목표를 시작해주세요.'
        }, {
            icon : "concentrate",
            title:"지금 하시는 일에 확신을 가지세요.",
            subtitle:"모든 목표, 모든 도전의 처음에는 확신을 갖기가 힘듭니다. 그래도, 지금의 목표에 확신을 가지고 목표에 임해주세요."
        });
    }
    if(hyde.o <= 3) {
        res.push({
            icon : "challenge",
            title: "가끔은 모험을 해야해요.",
            subtitle:"나와 안맞는 목표도 한번쯤은 도전해볼만한 가치가 있습니다. 언제나 인생이 안정적이라는 보장이 없으니까요."
        })
    }

    return res;
}

function* getstatusadvice(devi, avg, cost) {
    //평균이 높다 > 85
    //평균이 낮다 35 <
    var res = [];

    if(cost >= 85) {
        res.push({
            icon : "rest",
            title: "도전 후에는 충분히 휴식을 취하세요.",
            subtitle : "휴식 없이 계속 몰아치면, 언젠가는 지치게 됩니다. 목표까지 지치지 않기 위해서는 충분한 휴식을 취해주세요."
        })
    }

    if(avg <= 40) {
        res.push({
            icon : "otl",
            title: "실패하더라도 변명하지 마세요.",
            subtitle : "변명과 자기위로로 지나간 결과가 바뀌지 않습니다. 오히려, 더 비참해지거나 수렁에서 헤어나오기가 힘들수도 있습니다."
        });
    }

    if(devi > 25) {
        res.push({
            icon : "regular1",
            title: "몰아서 해도 아무 소용 없어요.",
            subtitle : "몰아치면 오히려 몸만 피곤하고 목표에서 멀어지기도 합니다. 꾸준하게 목표를 이뤄나가기 위해 노력해주세요."
        });
    }

    if(devi > 28 && cost > 65) {
        res.push({
            icon : "regular2",
            title: "많이도 중요하지만, 꾸준한게 더 중요해요!",
            subtitle : "많이 하는것도 좋지만, 오히려 독이 될수도 있습니다. 정하신 만큼 꾸준하게 하는게 지금은 더 좋을것 같아요."
        });
    }

    if(devi < 6 && avg > 90) {
        res.push({
            icon : "stable",
            title: "지금 상태를 유지하는것에 집중해주세요.",
            subtitle : "목표에서 어려운 것들 중 하나는 지금상태를 유지하는 것입니다. 지금의 좋은 상태를 유지하는것에 집중해주시면 좋을것 같아요."
        });
    }
}

module.exports.gethyde = gethydeadvice;
module.exports.getstatus = getstatusadvice;