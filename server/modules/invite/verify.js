'use strict';

var util = require('util');
var redis = require('redis');
var wrapper = require('co-redis');
var fs = require('co-fs');
var client = wrapper(redis.createClient('6379'));

//파일로 빼내오기!
function* openInvite(req, res) {
    var HTML = yield fs.readFile(__dirname + '/invite.html', 'utf8');
    try {
        var result = yield client.get(req.params.uuid);
        console.log(req.params.uuid + " : " + result);
        if (result == null) throw new Error("result is null");

        // create deep link
        var link = 'solin://invite', referrer = '';
        if (result.goalId) {
            link += '?goalId='+result.goalId; 
            referrer = '&referrer=goalId%3D'+result.goalId;
        }

        // create html page
        res.type = 'text/html';
        return util.format(HTML, link, referrer);

    }catch(e) {
        log.error('/invite/:uuid : ' + e);
        return setting.status.SERVER_ERROR;
    }
}

module.exports = openInvite;