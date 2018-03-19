/**
 * Created by juwoong on 2015. 9. 3..
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Report = new Schema({
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

var ReportTemplete = new Schema({
    userId          : {type : Schema.Types.ObjectId, ref : 'user'},
    goalId          : {type : Schema.Types.ObjectId, ref : 'goal'},
    report          : [Report]
});

module.exports.reportTemplete = mongoose.model("reportTemplete", ReportTemplete);
module.exports.report = mongoose.model("report", Report);