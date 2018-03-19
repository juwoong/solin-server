var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeedbackSchema = new Schema({
    type : String,
    date : Date,
    userId : {type : Schema.ObjectId, ref : 'user'},
    question : String,
    answer : String
});

module.exports.feedback = mongoose.model('feedback', FeedbackSchema);