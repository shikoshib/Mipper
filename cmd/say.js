const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setNameLocalization("ru", "сказать")
        .setDescription("Send the message on bot's behalf")
        .setDescriptionLocalization("ru", "Отправить сообщение от лица бота")
        .addStringOption((opt) => opt
            .setName("message")
            .setNameLocalization("ru", "сообщение")
            .setDescription("The message to send")
            .setDescriptionLocalization("ru", "Сообщение, которое нужно отправить")
            .setMaxLength(2000)
            .setRequired(true)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let msg = interaction.options.getString("message");
        interaction.editReply({ content: msg });
    }
}