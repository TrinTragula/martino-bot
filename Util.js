const fs = require("fs");

const Util = {
    setMartinoProfilePic: (bot, msg) => {
        const chatId = msg.chat.id;
        bot.setChatPhoto(chatId, 'img/martino.jpg');
    },
    citazioneRandom: (query) => {
        let cits = Util.getCitazioni()
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
    },
    getCitazioni: () => {
        let fileCits = fs.readFileSync('citazioni.json', 'utf8');
        let cits = JSON.parse(fileCits)["citazioni"];
        return cits;
    },
    immagineRandom: () => {
        const images = fs.readdirSync('img');
        const image = images[Math.floor(Math.random() * images.length)];
        return "img/" + image;
    }
};

module.exports = Util;