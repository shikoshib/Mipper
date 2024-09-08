const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setNameLocalization("ru", "пинг")
        .setDescription("Get the bot's response latency")
        .setDescriptionLocalization("ru", "Проверить задержку бота"),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        const desc = `${langFile["LATENCY"]} ${new Date().getTime() - interaction.createdTimestamp} ${langFile["MS"]}.`

        interaction.editReply({ embeds: [new MessageEmbed().setTitle(`🏓 ${langFile["PONG"]}`).setDescription(desc).setColor("#807fff")] });
    }
}