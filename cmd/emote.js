const { SlashCommandBuilder } = require("@discordjs/builders");
const { Util, MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
const emojiRegex = require("emoji-regex");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("emote")
        .setNameLocalization("ru", "эмодзи")
        .setDescription("Get the raw image of an emoji")
        .setDescriptionLocalization("ru", "Получить оригинальный файл эмодзи")
        .addStringOption(opt => opt
            .setName("emoji")
            .setNameLocalization("ru", "эмодзи")
            .setDescription("The emoji to get a raw image of")
            .setDescriptionLocalization("ru", "Эмодзи, оригинальный файл которого нужно получить")
            .setRequired(true)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let rawEmoji = interaction.options.getString("emoji");

        if (Number(rawEmoji).toString() != "NaN") {
            let url = `https://cdn.discordapp.com/emojis/${rawEmoji}.gif`
            let gifReq = await fetch(url);
            if (gifReq.status >= 400) {
                url = `https://cdn.discordapp.com/emojis/${rawEmoji}.png`;
                let pngReq = await fetch(url);
                if (pngReq.status >= 400) {
                    return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setDescription(langFile["EMOTE_NOT_FOUND"]).setTitle(`❌ ${langFile["ERROR"]}`)] })
                }
            }
            return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setFooter({ text: `ID: ${rawEmoji}` }).setImage(url)] });
        } else {
            if (rawEmoji.match(emojiRegex())) {
                const codePoints = [...rawEmoji].map(v => v.codePointAt(0).toString(16)).join("-");
                return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setImage(`https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/${codePoints}.png`)] });
            }

            const emoji = Util.parseEmoji(rawEmoji);

            if (emoji.id) {
                const ext = emoji.animated ? ".gif" : ".png";
                const url = `https://cdn.discordapp.com/emojis/${emoji.id + ext}`;
                interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setFooter({ text: `ID: ${emoji.id}` }).setImage(url)] });
            } else {
                return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setDescription(langFile["EMOTE_INVALID"]).setTitle(`❌ ${langFile["ERROR"]}`)] })
            }
        }
    }
}