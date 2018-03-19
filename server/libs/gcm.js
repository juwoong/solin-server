/**
 * Created by juwoong on 15. 9. 14..
 */
var gcm = require('node-gcm');
var sender = new gcm.Sender("AIzaSyAwqEkdAZ0hKLUj9aC-88j3isVgqIJAN1o");

function send(gcmKey, data, payload, collapse) {
    data.payload = payload;

    var message = new gcm.Message({
        delayWhileIdle: true,
        collapseKey : collapse,
        timeToLive: 10,
        data : data
    });

    if(typeof gcmKey == 'string') {
        var temp = gcmKey;
        gcmKey = [];
        gcmKey.push(temp);
    }
    sender.send(message, {registrationIds : gcmKey}, 10, function(err, res) {
        console.log("senting..");
        if(err) log.error(err);
        console.log(res);
    });
}

module.exports=send;