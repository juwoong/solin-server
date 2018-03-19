/**
 * Created by juwoong on 15. 9. 14..
 */
var moment = require('moment');

function average(list, duration) {
    if(list.length==0) return 0;
    var sum = 0;
    var now = moment(moment().format('YYYY-MM-DD'));

    for(var i=list.length-1; i>=0; i--) {
        console.log(list[i]);
        if(now.diff(list[i].date, 'days') >= duration) break;
        sum += list[i].percent;
    }

    return sum / duration;
}

function limitaverage(list, duration) {
    if(list.length==0) return 0;
    var sum = 0;
    var now = moment(moment().format('YYYY-MM-DD'));
    //Object.keys(list);

    for(var i=list.length-1; i>=0; i--) {
        if(now.diff(list[i].date, 'days') >= duration) break;
        sum += (list[i].percent>100?100:list[i].percent);
    }

    return sum / duration;
}

function deviation(list, duration) {
    if(list.length==0) return 0;
    var avg = limitaverage(list, duration);
    var sum = 0;
    var now = moment(moment().format('YYYY-MM-DD'));

    var i = 0;
    for (i=list.length-1; i>=0; i--) {
        if(now.diff(list[i].date, 'days') <= 0) break;
    }

    var n = i >= 0 ? i : 0;
    var loc = moment(now.format('YYYY-MM-DD')).add(-duration, 'days');

    for(i=n; i<list.length;i++) {
        while(now.diff(loc, 'days') >= 0) {
            loc.add(1, 'days');
            sum += Math.pow(0-avg, 2);
        }

        sum += Math.pow((list[i].percent>100?100:list[i].percent) - avg, 2);
        loc.add(1, 'days');
    }

    return Math.sqrt(sum/duration);
}

module.exports.average=average;
module.exports.deviation=deviation;
module.exports.limitavg = limitaverage;
