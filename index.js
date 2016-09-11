/**
 * Created by julian on 15.05.2016.
 */
console.log('Starting Init!');
var Discord = require("discord.js");
var options = {
    ws: {
        large_threshold: 250,
        compress: true,
        properties: {
            $os: process ? process.platform : 'discord.js',
            $browser: 'discord.js',
            $device: 'discord.js',
            $referrer: '',
            $referring_domain: ''
        }
    },
    protocol_version: 6,
    max_message_cache: 1500,
    rest_ws_bridge_timeout: 5000,
    api_request_method: 'sequential',
    shard_id: 0,
    shard_count: 0,
    fetch_all_members: true
};
var bot = new Discord.Client(options);
var CMD = require('./helper/cmdman');
var config = require('./config/main.json');
var mongoose = require('mongoose');
var socket = require('socket.io-client')('http://127.0.0.1:7004/bot');
var socketManager = require('./helper/socket/basic');
var messageHelper = require('./helper/utility/message');
var voice = require('./helper/utility/voice');
var async = require('async');
console.log('Connecting to DB');
mongoose.connect('mongodb://localhost/discordbot', function (err) {
    if (err) return console.log("Unable to connect to Mongo Server!");
    console.log('Connected to DB!');
});
console.log('Logging in...');
bot.login(config.token).then(console.log('Logged in successfully'));
socketManager.init(socket);
console.log('Bot finished Init');
bot.on('ready', function () {
    bot.user.setStatus('online', '!w.help for Commands!').then(user => console.log('Changed Status Successfully!')).catch(console.log);
    bot.on('serverCreated', function (server) {
        console.log('Joined Server ' + server.name);
    });
    setTimeout(function () {
        console.log('start loading Voice!');
        async.each(bot.guilds.array(), function (guild, cb) {
            voice.loadVoice(guild, function (err, id) {
                if (err) return cb(err);
                if (typeof (id) !== 'undefined' && id !== '') {
                    console.log('started joining guild:' + guild.name);
                    var channel = voice.getChannelById(guild, id);
                    if (typeof (channel) !== 'undefined') {
                        channel.join().then(connection => {
                            var message = {guild:guild};
                            voice.autoStartQueue(bot,message);
                            cb();
                        }).catch(cb);
                    }
                } else {
                    cb();
                }
            });
        }, function (err) {
            if (err) return console.log(err);
            console.log('Finished Loading Voice!');
        });
    }, 10000)
});
bot.on('disconnected', function () {

});
bot.on("message", function (message) {
    // console.log(message.mentions.users);
    if (message.content.charAt(0) === "!") {
        if (message.content.charAt(1) === "w") {
            CMD.basic(bot, message);
            CMD.music(bot, message);
            CMD.osuNoMusic(bot, message);
            CMD.youtube(bot, message);
            CMD.moderation(bot,message);
            CMD.hentai(bot,message);
            CMD.proxer(bot,message);
            // CMD.permission(bot,message);
            // CMD.playlist(bot,message);
        }
    } else if (message.guild && !message.mentions.users.exists('id', bot.user.id) && !message.author.equals(bot.user)) {
        messageHelper.updateXP(bot, message, function (err) {
            if (err) return console.log(err);
        });
    }
    if (!!message.mentions.users.get(bot.user.id) && message.mentions.users.size === 1) {
        CMD.cleverbot.talk(bot, message);
    }
});
bot.on('serverNewMember', function (Server, User) {

});
bot.on('serverMemberRemoved', function (Server,User) {

});
bot.on("debug", console.log);
bot.on("warn", console.log);