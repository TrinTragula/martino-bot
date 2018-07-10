const TelegramBot = require('node-telegram-bot-api');
const token = '{TOKEN}';
const bot = new TelegramBot(token, { polling: true });

/*
    Handle commands
*/
var commands = {
    "start": (msg, command, argument) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Bella regà");
    },
    "help": (msg, command, argument) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, JSON.stringify(commands));
    },
    "porcozio": (msg, command, argument) => {
        if (argument && argument.length > 0) {
            const oggetto = argument.join(" ");
            const chatId = msg.chat.id;
            var msg = `${oggetto}, non devi rompere il cazzo porco zio`;
            bot.sendMessage(chatId, msg);
        } else {
            var msg = `Ma quanto te pare de esse divertente porco zio`;
            bot.sendMessage(chatId, msg);
        }
    }
};

bot.onText(/\/(.+)/, (msg, match) => {
    const command = match[1];
    let splitted = command.split(' ');
    if (splitted && splitted.length > 0 && commands[splitted[0]]) {
        const command = splitted.shift();
        commands[command](msg, command, splitted);
    }
});

/*
    Handle keywords
*/
var keywords = {
    "dio": (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Porco zio, non bestemmiare");
    },
    "martino": (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Ma che cazzo vuoi " + msg.from.first_name);
    },
}

bot.on('message', (msg) => {
    var keys = Object.keys(keywords);
    for (key of keys) {
        if (msg.text.toString().toLowerCase().includes(key)) {
            keywords[key](msg);
        }
    }
});

/*
    Handle logging
*/

bot.on('message', (msg) => {
    console.log(JSON.stringify(msg));
});
