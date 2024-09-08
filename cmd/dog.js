const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dog")
        .setNameLocalization("ru", "собака")
        .setDescription("Get a random dog picture")
        .setDescriptionLocalization("ru", "Получить случайную картинку с собаками"),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let req = await fetch("https://dog.ceo/api/breeds/image/random");
        try {
            let resObj = await req.json();
            let imgUrl = resObj.message;
            interaction.editReply({ embeds: [new MessageEmbed().setImage(imgUrl).setColor("#807fff")] });
        } catch (e) {
            interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["SMTH_WRONG"]).setColor("#807fff")] });
        }
    }
}