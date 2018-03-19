/**
 * Created by juwoong on 15. 10. 15..
 */
var fs = require('fs');
var mongoose = require('mongoose');
var models = require('./models');
mongoose.connect('mongodb://solin:Thffls!0815mongodb@thedeblur.com:27017/solin');
var Goal = mongoose.model('goal');

Goal.find({}, function(err, docs) {
    var file = fs.createWriteStream('./list.txt', {flags : 'w'});
    for(var i=0; i<docs.length; i++) {
        file.write((i+1) + ": " + docs[i].name+'\n');
        console.log(docs[i].name);
    }

    file.end();
});