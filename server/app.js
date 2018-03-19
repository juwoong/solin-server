/*
 * Solin Server v0.0.1
 * Created by tamiflus on 15. 8. 8..
 */
var Logger = require('./libs/logger');
var mongoose = require('mongoose');
mongoose.connect('mongodb://solin:Thffls!0815mongodb@thedeblur.com:27017/solin');

global.authInfo = require('./oauth');
global.setting = require('./setting');
global.log = new Logger('solin');
global.encrypt = require('./libs/encrypt');

var model = require('./models')

var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var cottage = require('cottage');
var user = require('./modules/user');
var goal = require('./modules/goal');
var token = require('./modules/token');
var invite = require('./modules/invite');
var mongoose = require('mongoose');
var report = require('./modules/report')
var app = cottage();
var version = require('./modules/version');
var redis = require('redis');
var wrapper = require('co-redis');
var request = require('co-request');
var client = wrapper(redis.createClient('6379'));
var port = process.env.PORT || 4444;

app.use(bodyParser());

app.get('/health', function*() { return { status: 'ok!' } });
app.use(function*(next) {
    var start = new Date();
    yield next;
    var end = new Date();
    log.access(this.method +": "+ this.url + ', ' + (end-start) + ' millisec');
    //yield log.access(this.method +": "+ this.url + ', ' + (end-start) + ' millisec');
});
 
//Auth 필요없는 부분
app.post('/user', user.auth);
app.post('/user/me/refresh', token.refresh.verifyToken);
app.get('/inv/:uuid', invite.verify);
app.get('/v/:version', version);
app.get('/version', function*() {
    return require('./version')
});

//Auth Check
app.use(function*(next) {
    var verify = yield token.access.verifyToken(this.request.header.accesstoken);
    console.log('tokenverifing : ' + verify);
    if(verify != 401 && verify != 403) {
        this.request.params.userId = verify;
        yield next;

        //ERROR
        if(this.response.status==200) {
            //console.log('Safe!');
        }
    }
    if(verify==401 || verify == 403) {
        console.log('401 or 403');
	this.response.status = 401;
        this.body = {code : verify, msg : "마지막으로 로그인 하신지 너무 오래되신 것 같습니다. 다시 로인해 주세요!!"};
    }
    //else if(verify == 403) {
        //this.response.status = 403;
        //this.body = {code : verify, msg : "Expired Token"};
    //}
});

app.get('/user/me', user.auth.getUser);
app.post('/user/me/analyze', user.analyze);
app.get('/user/me/analyze', user.analyze.get);
app.post('/user/me/gcm', user.push.saveGcm);
app.get('/user/me/talk', user.talk);
app.post('/user/me/version', version.save);
app.post('/user/me/feedback', user.feedback);
app.get('/user/me/contents', goal.content);
app.get('/user/me/goals', user.goal.getList);              //목표 리스트
app.post('/user/me/goal', user.goal.add);                 //목표 추가하기
app.get('/goal/:goalid', user.goal.getOne);       //목표 세부 리스트 가져오기
app.get('/goal/:goalid/full', user.goal.getFullOne);
app.delete('/goal/:goalid/', goal.remove);
app.get('/goal/:goalid/collect', report.collect);
app.get('/goal/:goalid/farewell', goal.farewell);
app.get('/goal/:category/suggest', goal.suggest);
app.post('/goal/:goalid', user.goal.addResult);   //목표
app.post('/goal/:goalid/diary', goal.diary);
app.post('/invite', invite.create); //초대장 추가

//stating server;
console.log('Start server : ' + port);
koa().use(app).listen(port);
