// [ V A R I A B L E S ]
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var random = Math.floor((Math.random() * 3) + 1);

// [ L O G G E R   S E T T I N G S ]
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// [ I N I T I A L I Z E   B O T ]
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

// [ W E L C O M E   P L A Y E R ]
bot.on('guildMemberAdd', function (member) {
    bot.sendMessage({
        to: '609978851778363404',
        message: 'Welcome to the server!'
    });
});
