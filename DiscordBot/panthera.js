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
            newCharacter(message, message.content.slice(prefix.length).split(/:/));
            break;

        case "del-char":
            delCharacter(message);
            break;

        case "char-stats":
            setStats(message, args);
            break;

        case "char-inv":
            setInv(message, args);
            break;

        case "health":
            adjustHealth(message, args);
            break;

        case "exp":
            addXP(message, args);
            break;
        
        case "help-dm":
            dmCommands(message);
            break;

        case "add-stat":
            adjustStat(message, args);
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
        if (!dice.includes(diceRoll)) return message.channel.send(`${args[0]} is not a valid dice type.`); 
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
                        "`!new-char name : age : race : m/f` \n" +
                        "*Creates new character with given info. Age must be number representation between 17-1000 e.g. 20. For sex provide \"m\" or \"f\". Separate each argument with a colon.*\n" +
                        "--------------\n" + 
                        "`!del-char` \n" +
                        "*Deletes character from database.*\n" +
                        "--------------\n" + 
                        "`!char-stats health str int dex char` \n" +
                        "*Adds player health and sets stats. Give each stat a number between 1-4 as a ranking of where you want most points to go towards.*\n" +
                        "--------------\n" + 
                        "`!char-inv gold [item1] : [item2]` \n" +
                        "*Sets initial inventory with amount of gold and the option of two separate items. Separate each item with a colon.*");
}

function dmCommands(message) {
    if (message.author.username != 'Gazorpazorpfield') return message.channel.send("You are not authorized to use this command.");
    message.channel.send("**Hello Master, here are your powers:**\n" +
                        "--------------\n" + 
                        "`!health user amount` \n" +
                        "*Will subtract or add health to characters current health.*\n"+
                        "--------------\n" + 
                        "`!exp user amount` \n" +
                        "*Will add experience to characters current exp.*\n" +
                        "--------------\n" + 
                        "`!add-stat user stat` \n" +
                        "*Add +1 to the players provided stat.*\n")
}

// [ C H A R A C T E R   C R E A T E ]
function newCharacter(message, args) {
    var user = message.author.username;
    var name = "", age = 0, race = "", sex = 0;
    
    fs.readFile('./characters.json', 'utf-8', function(err, data) {
        if (err) throw err
    
        var characterArr = JSON.parse(data); 

        for (var i = 0; i < characterArr.charas.length; i++) {
            if(user in characterArr.charas[i]) {
                message.channel.send("You already have a character! If you would like to make a new one, " +
                                        "please use `!del-char` and try again.");
                return;
            }
        }

        if (args.length != 4) return message.channel.send("`usage: !new-char name : age : race : m/f`");
        
        name = args[0].slice(8);
    
        if (isNaN(args[1]) || args[1] > 1000 || args[1] < 17) 
            return message.channel.send(`${args[1]} is invalid age argument. Please give a numerical value between 17-1000.`);

        age = Math.floor(args[1]);
        race = args[2];
    
        if (args[3].trim() != 'm' && args[3].trim() != 'f') 
            return message.channel.send(`${args[3]} is invalid sex. Use only m or f for sex argument.`);

        sex = args[3];

        let chara = {
            [user]: {
                info: {
                    name : name.trim(),
                    age : age,
                    race : race.trim(),
                    sex : sex.trim()
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
    
        fs.writeFile('./characters.json', JSON.stringify(characterArr, null, 2), 'utf-8', function(err) {if (err) throw err});

        message.channel.send(`Welcome to the team ${name}! Use the command \`!char-stats\` to set stats and \`!char-inv\` to fill your inventory.`);
    });
}

// [ D E L E T E   C H A R A C T E R ]
function delCharacter(message) {
    fs.readFile('./characters.json', 'utf-8', function(err, data) {
        if (err) throw err;

        var user = message.author.username;
        var characterArr = JSON.parse(data); 
        var removed = false;

        for (var i = 0; i < characterArr.charas.length; i++) {
            if(user in characterArr.charas[i]) {
                characterArr.charas.splice(i, 1);
                removed = true;
            }
        }

        fs.writeFile('./characters.json', JSON.stringify(characterArr, null, 2), 'utf-8', function(err) {if (err) throw err});

        if (removed) message.channel.send("Your character has been successfully removed!");
        else message.channel.send("You do not have a character in the database.");
    });
}

// [ S E T   C H A R A C T E R   S T A T S ]
function setStats(message, args) {
    if (args.length != 5) {
        return message.channel.send(`You didn't provide correct arguments, ${message.author}! \n` +
        `\`usage: !char-stats health str int dex char\``);
    }

    var health = 0, str = 0, int = 0, dex = 0, char = 0;

    if (!isNaN(args[0])) health = Math.floor(args[0]);
    if (!isNaN(args[1])) str = Math.floor(args[1]);
    if (!isNaN(args[2])) int = Math.floor(args[2]);
    if (!isNaN(args[3])) dex = Math.floor(args[3]);
    if (!isNaN(args[4])) char = Math.floor(args[4]);

    if (!health || !str || !int || !dex || !char) {
        return message.channel.send(`You didn't provide correct arguments, ${message.author}! \n` +
                                    `\`usage: !char-stats health str int dex char\``);
    }

    if (str + int + dex + char != 10) return message.channel.send("Each stat must be uniquely ranked 1-4.");
    if (health > 200) return message.channel.send("Health must be below 200 healthpoints.");

    fs.readFile('./characters.json', 'utf-8', function(err, data) {
        if (err) throw err;

        var user = message.author.username;
        var characterArr = JSON.parse(data); 

        for (var i = 0; i < characterArr.charas.length; i++) {
            if(user in characterArr.charas[i]) {
                characterArr.charas[i][user].stats.health = health;
                characterArr.charas[i][user].stats.strength = Math.floor(Math.random() * str) + str;
                characterArr.charas[i][user].stats.intelligence = Math.floor(Math.random() * int) + int;
                characterArr.charas[i][user].stats.dexterity = Math.floor(Math.random() * dex) + dex;
                characterArr.charas[i][user].stats.charisma = Math.floor(Math.random() * char) + char;
            }
        }

        fs.writeFile('./characters.json', JSON.stringify(characterArr, null, 2), 'utf-8', function(err) {if (err) throw err});

        message.channel.send("Stats successfully set!");
    });
}

// [ S E T   C H A R A C T E R  I N V E N T O R Y ]
function setInv(message, args) {
    if (!args.length) {
        return message.channel.send(`You didn't provide gold count, ${message.author}! \n` +
        `\`usage: !char-inv gold [item1] : [item2]\``);
    }

    var gold = 0, item1 = "", item2 = "", change = false;

    if (!isNaN(args[0])) gold = Math.floor(args[0]);
    else return message.channel.send("Please enter a numerical value for your gold.");

    if (gold > 30) return message.channel.send("You cannot be that rich. I would say you look to be the holder of only 30 or less shillings.");

    for (var i = 1; i < args.length; i++) {
        if (args[i] == ':') change = true;
        else if (change) item2 = item2.concat(args[i], " ");
        else item1 = item1.concat(args[i], " ");
    }

    fs.readFile('./characters.json', 'utf-8', function(err, data) {
        if (err) throw err;

        var user = message.author.username;
        var characterArr = JSON.parse(data); 

        for (var i = 0; i < characterArr.charas.length; i++) {
            if(user in characterArr.charas[i]) {
                characterArr.charas[i][user].items.gold = gold;
                if (item1.length)
                    characterArr.charas[i][user].items['item1'] = item1.trim();
                if (item2.length)
                    characterArr.charas[i][user].items['item2'] = item2.trim();
            }
        }

        fs.writeFile('./characters.json', JSON.stringify(characterArr, null, 2), 'utf-8', function(err) {if (err) throw err});

        message.channel.send("Inventory successfully filled!");
    });
}

// [ T A K E   D A M A G E ]
function adjustHealth(message, args) {
    if (message.author.username != 'Gazorpazorpfield') return message.channel.send("You are not authorized to use this command.");

    var character = args[0];
    var adjustment = parseInt(args[1]);

    fs.readFile('./characters.json', 'utf-8', function(err, data) {
        if (err) throw err;

        var characterArr = JSON.parse(data); 
        var newHealth;

        for (var i = 0; i < characterArr.charas.length; i++) {
            if(character in characterArr.charas[i]) {
                characterArr.charas[i][character].stats.health += adjustment; 
                newHealth = characterArr.charas[i][character].stats.health;
            }
        }

        fs.writeFile('./characters.json', JSON.stringify(characterArr, null, 2), 'utf-8', function(err) {if (err) throw err});

        message.channel.send(`Health has been successfully adjusted. Health is now at ${newHealth} points.`);
    });
}

// [ I N C R E A S E   E X P E R I E N C E ]
function addXP(message, args) {
    if (message.author.username != 'Gazorpazorpfield') return message.channel.send("You are not authorized to use this command.");

    var character = args[0];
    var adjustment = parseInt(args[1]);

    fs.readFile('./characters.json', 'utf-8', function(err, data) {
        if (err) throw err;

        var characterArr = JSON.parse(data); 

        for (var i = 0; i < characterArr.charas.length; i++) {
            if(character in characterArr.charas[i]) {
                characterArr.charas[i][character].stats.exp += adjustment; 

                var currXP = characterArr.charas[i][character].stats.exp;
                var currLvl = characterArr.charas[i][character].stats.lvl;

                if (currXP >= (currLvl * (currLvl + 1)) * 14) {
                    currLvl++;
                    characterArr.charas[i][character].stats.lvl = currLvl;
                    message.channel.send(`You have leveled up! Congratulations! You are now level ${currLvl}.`);
                } 
                
                message.channel.send(`Your exp has been adjusted, you are now at ${currXP} exp.`);
            }
        }

        fs.writeFile('./characters.json', JSON.stringify(characterArr, null, 2), 'utf-8', function(err) {if (err) throw err});
    });
}

// [ A D J U S T   S T A T S ]
function adjustStat(message, args) {
    if (message.author.username != 'Gazorpazorpfield') return message.channel.send("You are not authorized to use this command.");

    var character = args[0];
    var stat = args[1];

    fs.readFile('./characters.json', 'utf-8', function(err, data) {
        if (err) throw err;

        var characterArr = JSON.parse(data); 

        for (var i = 0; i < characterArr.charas.length; i++) {
            if(character in characterArr.charas[i]) {
                characterArr.charas[i][character].stats[stat]++; 

                var points = characterArr.charas[i][character].stats[stat];

                message.channel.send(`${stat} has been adjusted to ${points} points.`);
            }
        }

        fs.writeFile('./characters.json', JSON.stringify(characterArr, null, 2), 'utf-8', function(err) {if (err) throw err});
    });
}

client.login(token);