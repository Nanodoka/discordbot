/**
 * Created by julia on 18.10.2016.
 */
/**
 * Created by julia on 02.10.2016.
 */
var cmd = 'radio';
// var config = require('../../config/main.json');
var add = require('./radio/add');
var list = require('./radio/list');
var logger = require('../../utility/logger');
var winston = logger.getT();
var remove = require('./radio/remove');
var execute = function (message) {
    let messageSplit = message.content.split(' ').slice(2);
    // winston.info(messageSplit);
    if (messageSplit.length > 0) {
        switch (messageSplit[0]) {
            case "add":
                add.exec(message);
                return;
            case "list":
                list.exec(message);
                return;
            case "remove":
                remove.exec(message);
                return;
            default:
                return;
        }
    } else {
        message.reply('What do you want to do radio?');
    }
};
module.exports = {cmd: cmd, accessLevel: 0, exec: execute};