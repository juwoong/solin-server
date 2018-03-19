/**
 * Created by juwoong on 15. 9. 22..
 */
'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('user');

function* checkVersion(req) {
    var available;
    if(req.params.version == setting.version) available = false;
    else available = true;


    return {version:setting.version, updateavailable:available};
}

function* saveVersion(req, res) {
    if(req.body.version == null) {
        res.status = 400;
        return setting.status.WRONG_REQUEST;
    }

    try {
        yield User.update({_id:req.params.userId}, {$set : {version : req.body.version}});
    } catch(e) {
        log.error('POST : /user/me/version : ' + e);
        log.error(e.stack);
        res.status = 500;
        return setting.status.SERVER_ERROR;
    }

    return {};
}

module.exports = checkVersion;
module.exports.save = saveVersion;