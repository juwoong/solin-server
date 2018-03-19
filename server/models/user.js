var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Activity = new Schema({
    image           : String,
    info            : String,
    createdAt       : { type : Date, default : Date.now() }
});

var Item = new Schema({
    type            : {type: String},
    image           : String,
    name            : String
});

var userSchema = new Schema({
    social          : {
        facebookId  : String,
        kakaoId     : String
    },
    refreshToken    : String,
    name            : String,
    profileImage    : String,
    statusMessage   : String,
    currentGoals    : [{type : Schema.ObjectId, ref : 'goal'}],
    completeGoals   : [{type : Schema.ObjectId, ref : 'goal'}],
    friends         : [{type : Schema.ObjectId, ref : 'user'}],
    activities      : [Activity],
    inventory       : [Number],
    personality     : {
        words       : [String],
        result      : String
    },
    version         : String
});

module.exports.Activity = mongoose.model("activity", Activity);
module.exports.Item = mongoose.model("item", Item);
module.exports.User = mongoose.model("user", userSchema);
