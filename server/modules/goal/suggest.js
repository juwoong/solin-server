/**
 * Created by juwoong on 15. 9. 20..
 */

function* suggest(req, res) {
    if(req.params.category == null) {
        res.status = 400;
        return setting.status.WRONG_REQUEST;
    }

    var list;

    switch(req.params.category) {
        case "etc":
            list = [
                {goal : "하루에 한번은 집밥 먹기", people:23},
                {goal : "하루에 한잔 커피 아껴서 기부하기", people:91},
                {goal : "하루에 주변 풍경 한장씩 찍기", people:21},
                {goal : "하루에 100원씩 모으기", people:38},
                {goal : "매일 20분씩 명상의 시간 가지기", people:31}
            ]
            break;
        case "sport":
            list = [
                {goal : "매일 줄넘기 하기", people : 48},
                {goal : "한강변 1km 조깅하기", people : 86},
                {goal : "매일 팔굽혀펴기 자기전에 하기", people: 93},
                {goal : "윗몸 일으키기 자기전에 하기", people: 32},
                {goal : "자전거 타고 출퇴근하기", people:23},
            ]
            break;
        case "habit_breaker":
            list = [
                {goal : "담배 끊기", people:139},
                {goal : "욕 하지 않기", people:21},
                {goal : "술 마시지 않기", people:185},
                {goal : "늦잠 자지 않기", people:102},
                {goal : "손톱 물어뜯지 않기", people:87}
            ];
            break;
        case "learn":
            list = [
                {goal : "클래식 기타 배우기", people:203},
                {goal : "파이선 프로그래밍 배우기", people:73},
                {goal : "피아노 독학하기", people:173},
                {goal : "캘리그라피 배워보기", people:214},
                {goal : "프랑스어 공부하기", people:47}
            ]
            break;
        case "challenge":
            list = [
                {goal : "하루에 한개 캘리그라피 쓰기", people:12},
                {goal : "매일 1000자씩 소설 써보기", people: 30},
                {goal : "매일 손으로 일기 쓰기", people:11},
                {goal : "기타로 노래 한곡 완주하기", people:32},
                {goal : "한주에 하나 그림 그리기", people:39},
            ];
            break;
        case "habit_maker":
            list = [
                {goal : "매일 물 8잔씩 마시기", people:88},
                {goal : "아침에 일찍 일어나기", people:19},
                {goal : "아침밥 챙겨먹기", people:39},
                {goal : "자기 전에 다음날 일정 정리하기", people:23},
                {goal : "하루에 한번씩 감사하다는 말 하기", people:17},
            ]
            break;
        default:
            res.status=400;
            return setting.status.WRONG_REQUEST;
    }

    var suggest=[];//result
    var length = 3;
    var key;

    for(var i=0; i<length; ){
        key = Math.floor(Math.random()*list.length);
        for (var j=0; j<suggest.length; j++){
            if(suggest[j].goal == list[key].goal) {j=-1; break;}
        }
        if(j==-1) continue;
        suggest.push(list[key]);
        i++;
    }
    return {list:suggest};
}


module.exports = suggest;