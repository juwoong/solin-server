/**
 * Created by juwoong on 15. 9. 18..
 */
'use strict';
var moment = require('moment');
var redis = require('redis');
var wrapper = require('co-redis');
var client = wrapper(redis.createClient('6379'));
var encrypt = require('../../libs/encrypt');

function* getTalk(day) {
    /**
     * 검색요소 Factor
     * : 무슨 목표를 진행하는가?
     * : 달성률은 어느정도 하는가?
     * : 시간
     **/
    var now = moment();
    var hour = now.hours();
    var list;
    /*if(day >= 7) {
        list = [
            '이거 써도 못볼것 같은데, ㅇㄹ머ㅏㅣㄴ....어, 오셨네요?',
            '계속 안오시길래 사무실 문 닫는 줄 알았어요 ㅜㅜ',
            '저 밉죠? 그래서 저 안보러 오시는 거죠? 그렇죠?'
        ];
    } else if(day >= 3) {
        list = [
            '헐, 오랜만이네요? 어디 아프신 줄 알았어요.',
            '아, 얼굴보고 가려고 있었는데.. 드디어 퇴근할 수 있겠네요ㅜㅜ',
            '타디스 타고 시간여행 다녀오셨었어요..?',
        ]
    }else {*/
        switch (hour) {
            case 0:
            case 1:
                list = [
                    '아직도 하고 계셨네요?\n목표 달성을 위해 열심히 하고 계신 거겠죠?',
                    '가끔 밤에는, 은하수에서 히치하이킹\n해보면 어떨까 생각하곤 해요.',
                    '지금 이맘때에는 뉴에이지를 주로 듣곤 해요.'
                ];
                break;
            case 2:
            case 3:
            case 4:
            case 5:
                list = [
                    '헉, 이때 들어오시다니.. 안 오실 줄 알고 자고 있었는데..',
                    '성향 분석을 하다보니 벌써 ' + hour + '시, 자긴 글렀네요.',
                    '드르렁...퓨...드르렁....퓨우.....',
                    '커피를 마시니 잠이 오지를 않네요. 어쩌죠?',
                    '자다 깨서 그런지 정신이 없어요.. 잠시만요'
                ];
                break;
            case 6:
            case 7:
            case 8:
                list = [
                    '안녕히 주무셨어요? 즐거운 아침이에요!',
                    now.format('YYYY년 M월 D일') + ", 새 아침이 밝았습니다!!",
                    '피곤하진 않으세요? 그래도 계획 실천할 생각은 하셔야 해요!',
                    '새로운 하루에 시작, 밥 챙겨 드시고, 화이팅!'
                ];
                break;
            case 20:
            case 21:
                list = [
                    '오늘 할일, 기록해주시는거 잊지 마세요!',
                    '오, 오늘 하루 어떠셨어요? 계획은요? 잘 되고 있어요?',
                    '피곤하시더라도 잠깐만 시간을 내보시는 건 어때요?',
                    '아, 오늘 기록 주러 오신거죠? ㅎㅎ',
                    '절 도와주실수 있으시죠? 그럼, 열심히 해 주세요!!'
                ];
                break;
            case 22:
            case 23:
                list = [
                    '김광석 노래를 들으면서\n하루를 정리하고 있는데, 마침 잘 오셨어요!',
                    '전 이 시간이 가장 좋아요. \n조용하니 일에 집중하기 편한 시간이거든요.',
                    '음, 오늘 사람들이 뭘 얼마나 했는지 볼까....',
                    '생각 정리할 때에는 커피가 좋죠.\n한잔 드시면서 잠시 생각해 보실래요?'
                ];
                break;
            default:
                list = [
                    '하루 하루 살아가면서, 하루 하루 열심히 하는 것.\n그게 중요한 것 같아요.',
                    '열심히 하는 사람들을 주변에서 보면,\n그만큼 얻어가는 것이 분명하더라구요.'
                ];
        }
    //}
    if(Math.random() > 0.8) list.push('허리를 피고 계세요. 그러면 다른 앱 쓸 필요 없잖아요 ㅎㅎ');

    return list[Math.floor(Math.random()*list.length)];
}

function* talking(req, res){
    //조건에 이 새끼는 부합하는가?
    //아 캐싱처리 어떻게하지
    //존나 이상한 방식으로 해놓고 나중에 욕먹어야지
    //var password = encrypt(req.params.userId);

    var now = moment();
    try {
        var talkString = yield client.get(req.params.userId+":talking");
        if(talkString != null) talkString = JSON.parse(talkString);

        if(talkString == null || now.diff(talkString.generateTime, 'hours') > 1) {
            var diff;
            if (talkString == null) diff = 0;
            else diff = now.diff(Date.parse(talkString.generateTime), 'days');
            console.log(diff);
            var talk = yield getTalk(diff, 'days');
            console.log(talk);
            talkString = JSON.stringify({
                message: talk,
                generateTime: now.format()
            });

            console.log(talkString);

            yield client.set(req.params.userId + ":talking", talkString);

            return {message: talk};
        } else {
            return {message:talkString.message};
        }
    } catch(e) {
        log.error('GET: /user/me/talking ' + e);
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }
}

module.exports = talking;
