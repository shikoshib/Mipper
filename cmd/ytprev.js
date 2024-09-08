const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ytprev")
        .setNameLocalization("ru", "yt-превью")
        .setDescription("Get the thumbnail from a YouTube video")
        .setDescriptionLocalization("ru", "Получить превью у видео на YouTube")
        .addStringOption((opt) => opt
            .setName("link")
            .setNameLocalization("ru", "ссылка")
            .setDescription("The link to a video")
            .setDescriptionLocalization("ru", "Ссылка на видео")
            .setRequired(true)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        function parse(url) {
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            var match = url.match(regExp);
            return (match && match[7].length == 11) ? match[7] : false;
        }
        let url = interaction.options.getString("link");
        let videoID = parse(url);
        if (!videoID) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["YTPREV_LINK_INVALID"])] });
        let qualityArray = ["maxresdefault", "sddefault", "hqdefault"];
        let hasFound;
        for (let quality of qualityArray) {
            let req = await fetch(`https://i.ytimg.com/vi/${videoID}/${quality}.jpg`);
            if (req.status >= 400) {
                continue;
            } else {
                interaction.editReply({ embeds: [new MessageEmbed().setTitle(`✅ ${langFile["DONE"]}`).setColor("#807fff").setImage(`https://i.ytimg.com/vi/${videoID}/${quality}.jpg`)] });
                hasFound = true;
                break;
            }
        }

        if (!hasFound) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["YTPREV_NOT_FOUND"])] });
    }
}