/**
 * Created by juwoong on 15. 9. 17..
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Card = new Schema({
    title : String,
    content : String,
    image : String
});


var Category = new Schema({
    name : String,
    lists : [{type: Schema.ObjectId, ref:'goal'}],
    card : [Card],
    diary : [{type: Schema.ObjectId, ref:''}]
});

module.exports.card = mongoose.model('card', Card);
module.exports = mongoose.model('category', Category);
