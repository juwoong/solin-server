/**
 * Created by tamiflus on 15. 8. 14..
 */
'use strict';

var crypto = require('crypto');

var val1 = '99e2254b134a33cf2d8bef866012e20301f3d1946b718a00619fd8b7a2e4c079';
var val2 = 'bafad983bb6bcef71400d73c5a0fb09d21059131636a99dd25742f0cd866c3f2';

module.exports.randomBase = function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}

module.exports = function encrypt(pw) {
    var i = 0;
    for (i=0; i<5; i++) {
        pw = crypto.createHash('sha256').update(val1 + pw + val2).digest('hex');
    }
    return pw;
}