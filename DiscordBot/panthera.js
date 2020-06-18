// [ V A R I A B L E S ]
const Discord = require('discord.js');
const { token } = require('./auth.json');
const config = require('./config.json');
const fs = require('fs');
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

        case "new-char":
            newCharacter(message, args);
            break;

        case "help":
        default:
            commands(message);
            break;
    }
});

// [ D I C E   R O L L S ]
function roll(message, args) {
    if (!args.length || args[0].charAt(0) != 'd') {
        return message.channel.send(`You didn't provide a dice, ${message.author}! \n` +
        `\`usage: !roll d[number] [quantity] [modifier]\``);
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

    if (quantity > 5) return message.channel.send(`${quantity} is too many dice. 5 dice max.`);
    if (modifier > 20) return message.reply('Yeah I bet you wish you were that OP. Try less than 20 for your modifier bub.');

    message.channel.send(`Rolling ${quantity} d${diceRoll} with a modifier of ${modifier}...`);

    for (var i = 0; i < quantity; i++) {
        var result = Math.floor((Math.random() * diceRoll) + 1) + modifier;
        message.channel.send(`Dice roll #${i+1}:\n${result}\n`);
    }
}

// [ C O M M A N D   H E L P ]
function commands(message) {
    message.channel.send("**Looks like you suck at commands, let me help you with that:**\n" +
                        "Note: [] represents an optional argument.\n" +
                        "--------------\n" + 
                        "`!roll d[number] [quantity] [modifier]` \n" +
                        "*Will roll [quantity] dice of [number] sides + [modifier]. Defaults to 1 d20 + 0. Valid dice: 4, 6, 8, 10, 12, 20.*\n" +
                        "--------------\n" + 
                        "`!new-char name age race m/f` \n" +
                        "*Creates new character with given info. Age must be number representation between 17-1000 e.g. 20. For sex provide \"m\" or \"f\".*");
}

// [ C H A R A C T E R   C R E A T E ]
function newCharacter(message, args) {
    var user = message.author.username;
    var name, age, race, sex;

    fs.readFile('./characters.json', 'utf-8', function(err, data) {
        if (err) throw err
    
        var characterArr = JSON.parse(data); 

        for (var i = 0; i < characterArr.charas.length; i++) {
            if(user in characterArr.charas[i]){
                message.channel.send("You already have a character! If you would like to make a new one, " +
                                        "please use `!del-char` and try again.");
                return;
            }
        }

        if (args.length != 4) {
            return message.channel.send("`usage: !new-char name age race m/f`");
        }
    
        name = args[0];
    
        if (isNaN(args[1]) || args[1] > 1000 || args[1] < 17) {
            return message.channel.send(`${args[1]} is invalid age argument. Please give a numerical value between 17-1000.`);
        }
    
        age = Math.floor(args[1]);
        race = args[2];
    
        if (args[3] != 'm' && args[3] != 'f') {
            return message.channel.send(`${args[3]} is invalid sex. Use only m or f for sex argument.`);
        }
    
        sex = args[3];

        let chara = {
            [user]: {
                info: {
                    name : name,
                    age : age,
                    race : race,
                    sex : sex
                },
                stats: {
                    health : 0,
                    exp : 0,
                    lvl : 1,
                    strength : 0,
                    intelligence : 0,
                    dexterity : 0,
                    charisma : 0
                },
                items: {
                    gold : 0
                }
            }
        }

        characterArr.charas.push(chara);
    
        fs.writeFile('./characters.json', JSON.stringify(characterArr, null, 2), 'utf-8', function(err) {
            if (err) throw err
        });

        message.channel.send(`Welcome to the team ${name}! Use the command \`!char-stats\` to set stats and \`!char-inv\` to fill your inventory.`);
    });
}

client.login(token);