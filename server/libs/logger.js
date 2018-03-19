'use strict';

var fs = require('fs');
var morgan = require('morgan');
var winston = require('winston');

function Logger(options) {
    if (!(this instanceof Logger)) {
        return new Logger(options);
    }
    var appName = 'appname';
    var logDir = __dirname + '/../logs';
    if (typeof options === 'string') appName = options;

    // Make logs directory
    try {
        fs.mkdirSync(logDir);
    } catch(e) {
        if (e.code !== 'EEXIST') throw e;
    }

    // Access level
    var levels = winston.config.syslog.levels;
    var colors = winston.config.syslog.colors;
    levels.access = 9;
    levels.crash = 10;
    colors.access = 'green';
    colors.crash = 'green';
    winston.addColors(colors);

    // Create winston loggers
    var logName = logDir + '/' + appName;
    var WinstonLogger = winston.Logger;
    var Console = winston.transports.Console;
    var DailyRotateFile = winston.transports.DailyRotateFile;

    this.logger = {
        info: new WinstonLogger({ level: 'info', transports: [ new Console({ colorize: true })]}),
        debug: new WinstonLogger({ level: 'debug', transports: [ new Console({ colorize: true }) ]}),
        warn: new WinstonLogger({ level: 'warn', transports: [
            new Console({ level: 'warn', colorize: true }),
            new DailyRotateFile({ level: 'warn', filename: logName + '-warn.log' })
        ]}),
        error: new WinstonLogger({ level: 'error', transports: [
            new Console({ level: 'error', colorize: true }),
            new DailyRotateFile({ level: 'error', filename: logName + '-error.log' }),
        ]}),
        access: new WinstonLogger({
            level: 'access',
            levels: levels,
            transports: [
                new Console({ level: 'access', colorize: true }),
                new DailyRotateFile({ level: 'access', filename: logName + '-access.log' })
            ]
        }),
        crash: new WinstonLogger({
            level: 'error',
            levels: levels,
            transports: [
                new Console({ colorize: true }),
                new DailyRotateFile({ filename: logName + '-crash.log' })
            ]
        })
    };

    var self = this;
    process.on('uncaughtException', function(err) {
        self.crash(err.stack);
    });
}

var levels = ['info', 'debug', 'warn', 'error', 'access', 'crash'];
levels.forEach(function(level) {
    Logger.prototype[level] = new Function('msg', 'this.logger.'+level+'.'+level+'(msg)');
});


module.exports = Logger;