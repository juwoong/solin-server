/**
 * Created by juwoong on 15. 9. 19..
 */
var mongoose = require('mongoose');
var Category = mongoose.model('category');
var Goal = mongoose.model('goal');
var User = mongoose.model('user');

function* getcontent(goalid){
    try {
        var goal = yield Goal.findById(goalid);
        if (goal == null) throw new Error('goal cannot found');

        var list = [];

        for (i in goal.category) {
            var card = yield Category.find({name : i});

            list.push(card.card);
        }

        return list;

    }catch(e) {
        return 500;
    }
}

function* content(req, res) {
    try {
        var user = yield User.findById(req.params.userId);
        if(user == null) throw new Error('Cannot found');

        var list = [];
        for(i in user.currentGoals) {
            var contentresult = yield getcontent(i);
            if(contentresult == 500) continue; //throw new Error('goal cannot found');
            list = list.concat(contentresult);
        }

        /*if (user.name === '김효준' || user.name === '배주웅' || user.name === '이찬희' || user.name === '양상현')  {
		var billy = "http://i861.photobucket.com/albums/ab175/cozman84/Favs/BillyHerrington.jpg";
		var hotsan = 'https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xta1/t31.0-8/11114026_867052820040421_8379916249406092102_o.jpg';
		var yangingni = 'https://scontent.xx.fbcdn.net/hphotos-xat1/v/t34.0-12/12029101_940141849380637_151416642_n.jpg?oh=920dfccb6a016917f2f9d35967274323&oe=5608118B';
		list = [{ content: "열심히 하면 이 사람처럼 될 수 있어요!", title: "", image: billy},
			{ content: "이 사람처럼 열심히 운동해보는건 어때요?", title: "", image: hotsan},
			{ content: "이 사람을 본받으세요!", title: "", image: yangingni}];
	}*/
        return {list : list};
    } catch(e){
        log.error('GET /user/me/content ' + e);
        log.error(e.stack);
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }
}

module.exports = content;
