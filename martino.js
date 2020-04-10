require('dotenv').load();
const TelegramBot = require('node-telegram-bot-api');
const Util = require('./Util');
const mongo = require('./mongo');
const TOKEN = process.env.TOKEN;
const options = {
    webHook: {
        port: process.env.PORT
    }
};

const url = process.env.APP_URL;
const bot = new TelegramBot(TOKEN, options);
bot.setWebHook(`${url}/bot${TOKEN}/${TOKEN}`);

const VERSIONE = "0.1.1";

const sendToEverybody = (msg, pic) => {
    pic = pic || null;
    mongo.connectToServer(function (err) {
        const db = mongo.getDb();
        db.db().collection('comandi').distinct("msg.chat.id", {}, (err, chatIds) => {
            if (chatIds) {
                for (const chatId of chatIds) {
                    if (pic) {
                        bot.sendPhoto(chatId, pic, {
                            caption: msg
                        });
                    } else {
                        bot.sendMessage(chatId, msg);
                    }
                }
            }
        });
    });
}

// Invio eventuali annunci
mongo.getAnnouncement(VERSIONE, (annuncio) => {
    if (annuncio && annuncio.messaggio) {
        sendToEverybody(annuncio.messaggio);
    }
});

/*
    Handle commands
*/
var commands = {
    "start": (msg, command, argument) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Bella regà");
        if (!msg.chat.type == "private") Util.setMartinoProfilePic(bot, msg);
    },
    "help": (msg, command, argument) => {
        const chatId = msg.chat.id;
        let message = "Ecco i miei appunti:\n\n";
        message += "/start\n";
        message += "Bella regà\n\n";
        message += "/help\n";
        message += "Questo messaggio\n\n";
        message += "/porcozio [nome facoltativo]\n";
        message += "Non fatemi arrabbiare\n\n";
        message += "/citazione [ricerca facoltativa]\n";
        message += "Saggezza dispensata a caso\n\n";
        message += "/immagine\n";
        message += "Rifatti gli occhi\n\n";
        message += "Rispondo anche inline!\n(non offenderti Martino pls)\n\n";

        message += "E come disse Martino: \n"
        message += "```\nIo ho già raggiunto l\'immortalità salvando la mia coscienza nel martino bot. Finché ci sarà internet io vivrò.\n```\n\n"
        message += "Codice:\nhttps://github.com/TrinTragula/martino-bot";

        bot.sendMessage(chatId, message, {
            parse_mode: "Markdown"
        });
    },
    "porcozio": (msg, command, argument) => {
        const chatId = msg.chat.id;
        if (argument && argument.length > 0) {
            const oggetto = argument.join(" ");
            var messaggio = `${oggetto}, non devi rompere il cazzo porco zio`;
            bot.sendMessage(chatId, messaggio);
        } else {
            var messaggio = `Ma quanto te pare de esse divertente porco zio`;
            bot.sendMessage(chatId, messaggio);
        }
    },
    "citazione": (msg, command, argument) => {
        const chatId = msg.chat.id;
        if (argument && argument.length > 0) {
            let cit = Util.citazioneRandom(argument.join(" "));
            bot.sendMessage(chatId, cit || "Di cosa stai parlando?");
        } else {
            bot.sendMessage(chatId, Util.citazioneRandom());
        }
    },
    "immagine": (msg) => {
        const chatId = msg.chat.id;
        bot.sendPhoto(chatId, Util.immagineRandom());
    },
    "stats": (msg, command, argument) => {
        const chatId = msg.chat.id;
        mongo.connectToServer(function (err) {
            const db = mongo.getDb();
            db.db().collection('comandi').aggregate([{
                $group: {
                    _id: {
                        name: "$msg.from.first_name",
                        username: "$msg.from.username",
                    },
                    count: {
                        $sum: 1
                    }
                },
            }, {
                $sort: {
                    count: -1
                }
            }],
                function (err, result) {
                    result.limit(5).toArray()
                        .then(stats => {
                            let counter = 0;
                            stats = stats.map(x => {
                                counter++;
                                return `*${counter}° classificato:*\n${x._id.name}${x._id.username ? " (@" + x._id.username + ")" : ""}\n_${x.count} messaggi_\n`
                            });

                            let msg = "Classifica utilizzo del bot:\n\n"
                            msg += stats.join("\n")
                            bot.sendMessage(chatId, msg, {
                                parse_mode: "Markdown"
                            });
                        });
                    db.close();
                });
        });
    },
};

function executeCommand(msg, command) {
    let splitted = command.split(' ');
    if (splitted && splitted.length > 0 && commands[splitted[0]]) {
        const command = splitted.shift();
        commands[command](msg, command, splitted);
    }
    mongo.insert({
        date: new Date(),
        msg: msg,
        command: command
    });
}

bot.onText(/\/(.+)/, (msg, match) => {
    const command = match[1];
    executeCommand(msg, command);
});
bot.onText(/\/(.+)\@martinosilvettibot/, (msg, match) => {
    const command = match[1];
    executeCommand(msg, command);
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
    "matricola": (msg) => {
        const chatId = msg.chat.id;
        bot.sendPhoto(chatId, 'img/martino.jpg');
    },
    "scappi?": (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Non rompe i coglioni, c'ho da fare!");
    },
    "esn": (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Entrate in ESN perdenti #staylemon");
    },
    "preservativo": (msg) => {
        const chatId = msg.chat.id;
        bot.sendVoice(chatId, "audio/suoni_bizzarri.mp3");
    },
    "preservativi": (msg) => {
        const chatId = msg.chat.id;
        bot.sendVoice(chatId, "audio/suoni_bizzarri.mp3");
    },
    "pasta": (msg) => {
        const chatId = msg.chat.id;
        bot.sendVoice(chatId, "audio/pasta.mp3");
    },
    "spaghetti": (msg) => {
        const chatId = msg.chat.id;
        bot.sendVoice(chatId, "audio/pasta.mp3");
    },
    "gigi": (msg) => {
        const chatId = msg.chat.id;
        bot.sendVoice(chatId, "audio/gigidag.mp3");
    },
    "agostino": (msg) => {
        const chatId = msg.chat.id;
        bot.sendVoice(chatId, "audio/gigidag.mp3");
    },
    "toujour": (msg) => {
        const chatId = msg.chat.id;
        bot.sendVoice(chatId, "audio/gigidag.mp3");
    },
    "internet": (msg) => {
        const chatId = msg.chat.id;
        bot.sendVoice(chatId, "audio/internet.mp3");
    }
}

bot.on('message', (msg) => {
    var keys = Object.keys(keywords);
    for (key of keys) {
        if (msg && msg.text && msg.text[0] != "/" && msg.text.toString().toLowerCase().includes(key)) {
            keywords[key](msg);
        }
    }
});

bot.on('inline_query', (msg) => {
    const id = msg.id;
    const query = msg.query;
    let result = [];
    if (query && query != "") {
        let cit = Util.citazioneRandom(query);
        result.push(Util.createInlineTextResponse(cit));
    } else {
        for (let i = 0; i <= 3; i++) {
            let cit = Util.citazioneRandom();
            result.push(Util.createInlineTextResponse(cit));
        }
    }
    bot.answerInlineQuery(id, result && result.length > 0 ? result : ["Di cosa stai parlando?"], {
        cache_time: 0
    });
});

bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;
    if (msg.new_chat_member && (msg.new_chat_member.username || msg.new_chat_member.first_name)) {
        if (msg.new_chat_member.username == "martinobetabot") {
            bot.sendMessage(chatId, "Bella regà");
        } else {
            let name = msg.new_chat_member.first_name;
            bot.sendMessage(chatId, `Daje, ${name}, scappi?`);
        }
    }
});

bot.on('left_chat_member', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Poraccio.`);
});

let alreadySent = false;
const checkIfIsGiovedi = () => {
    const date = new Date();
    if (date.getDay() == 4 && date.getHours() == 20 && date.getMinutes() == 0 && !alreadySent) {
        sendToEverybody("Ragà, non scappate stasera, me raccomando", "img/martino-quarantena.jpg");
        alreadySent = true;
    } else {
        alreadySent = false;
    }
}

setInterval(checkIfIsGiovedi, 55 * 1000);