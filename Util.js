const fs = require("fs");

const Util = {
    setMartinoProfilePic: (bot, msg) => {
        const chatId = msg.chat.id;
        bot.setChatPhoto(chatId, 'img/martino.jpg');
    },
    citazioneRandom: (query) => {
        let fileCits = fs.readFileSync("citazioni.txt", 'utf8');
        let cits = fileCits.toString().split("\r\n");
        if (query) {
            cits = cits.filter(x => x.includes(query));
        }
        return cits[Math.floor(Math.random() * cits.length)];
    },
    createInlineTextResponse: (text) => {
        return {
            type: "article",
            id: Math.floor(Math.random() * 100000000),
            title: text.length > 30 ? (text.slice(0, 30) + "...") : text,
            input_message_content: {
                message_text: text
            },
            description: text.length > 50 ? (text.slice(0, 50) + "...") : text
        }
    }
};

module.exports = Util;