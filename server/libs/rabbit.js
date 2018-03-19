/**
 * Created by juwoong on 2015. 9. 13..
 */
//`use strict`;
var amqp = require('amqplib/callback_api');

function workerSender(str) {
    amqp.connect(setting.rabbitmq.url, function(err, conn) {
       conn.createChannel(function (err, ch) {
           str = JSON.stringify(str);
           ch.assertQueue(setting.rabbitmq.channel, {durable : false});
           ch.sendToQueue(setting.rabbitmq.channel, new Buffer(str));

           log.access(" [x] Send to nlp : " + str);
       });

        setTimeout(function() {
            conn.close();
        }, 500);
    });
}

module.exports=workerSender;
