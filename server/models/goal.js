/**
 * Created by juwoong on 2015. 8. 19..
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Result = new Schema({
    date : Date,
    percent : Number,
    result : Number
});

var Diary = new Schema({
    userId : {type: Schema.ObjectId, ref:'user'},
    goalId : {type: Schema.ObjectId, res:'goal'},
    date : Date,
    content : String
});


var Farewell = new Schema({
    isMonthly       : Boolean,
    name            : String,
    generateAt      : Date,
    result          : [Number],
    total           : Number,
    totalComment    : {
        main        : String,
        sub         : String
    },
    average         : Number,
    count           : Number,
    fail            : [Number],
    endurance       : {
        main        : String,
        sub         : String,
        percent     : Number
    }
});

var UserInGoal = new Schema({
    Id : Schema.Types.ObjectId,
    name : { type : String, max : 10 },
    profileImage : { type : String, length : 64 },
    target : {
        score : Number,
        type : {type : String}
    },
    startAt : Date,
    result : [Result],
    diaries : [{type: Schema.ObjectId, res:'diary'}],
    farewell : Farewell,
});

var Goal = new Schema({
    name : { type : String, max : 100 },
    tags : [String],
    startDate : Date,
    endDate : Date,
    category : String,
    threeLegged : Boolean,
    users : [UserInGoal],
});

module.exports.Diary = mongoose.model('diary', Diary);
module.exports.Goal = mongoose.model('goal', Goal);
module.exports.UserInGoal = UserInGoal;
module.exports.Result = Result;