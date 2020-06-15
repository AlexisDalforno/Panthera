// [ V A R I A B L E S ]
const Discord = require('discord.js');
const { token } = require('./auth.json');
const config = require('./config.json');
const prefix = config.prefix;


const dice = ['4', '6', '8', '10', '12', '20'];

// [ I N I T I A L I Z E   B O T ]
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Connected');
});

// [ C O M M A N D   H A N D L E R ]
client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case "roll":
            roll(message, args);
            break;

        default:
            commands(message);
            break;
    }
});

// [ D I C E   R O L L S ]
function roll(message, args) {
    if (!args.length || args[0].charAt(0) != 'd') {
        return message.channel.send(`You didn't provide a dice, ${message.author}! \n \
        usage: !roll d[number] [quantity] [modifier]`);
    }
    
    var diceRoll = 20;
    var quantity = 1;
    var modifier = 0;

    if (args[0].length > 1 && !isNaN(args[0].substr(1))) {
        diceRoll = args[0].substr(1);
        if (!dice.includes(diceRoll)) 
            return message.channel.send(`${args[0]} is not a valid dice type.`); 
    }

    if (args.length > 1 && !isNaN(args[1])) quantity = Math.floor(args[1]);
    if (args.length > 2 && !isNaN(args[2])) modifier = Math.floor(args[2]);

    if (quantity > 5) return message.channel.send(`${quantity} is too many dice. Stop.`);

    message.channel.send(`Rolling ${quantity} d${diceRoll} with a modifier of ${modifier}...`);

    for (var i = 0; i < quantity; i++) {
        var result = Math.floor((Math.random() * diceRoll) + 1) + modifier;
        message.channel.send(`Dice roll #${i+1}:\n${result}\n`);
    }
}

// [ C O M M A N D   H E L P ]
function commands(message) {
    message.channel.send("Looks like you suck at commands, let me help you with that: \n \
                          !roll d[number] [quantity] [modifier] || Will roll [quantity] dice of [number] sides + [modifier]. \
                                                                   Defaults to 1 d20 + 0.\n \
                          !status                               || Checks Panthera MC server status.");
}


client.login(token);