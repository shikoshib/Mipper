const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("Ask the magic ball a question")
        .setDescriptionLocalization("ru", "Задать магическому шару вопрос")
        .setNameLocalization("ru", "шар")
        .addStringOption((opt) => opt
            .setName("question")
            .setNameLocalization("ru", "вопрос")
            .setDescription("The question to ask")
            .setMaxLength(1024)
            .setDescriptionLocalization("ru", "Вопрос, который нужно задать")
            .setRequired(true)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let question = interaction.options.getString("question");
        let answers = langFile["8BALL_ANSWERS"];
        let answer = answers[Math.floor(Math.random() * (answers.length))];
        interaction.editReply({ embeds: [new MessageEmbed().addFields({ name: `❓ ${langFile["8BALL_QUESTION"]}`, value: question }, { name: `🎱 ${langFile["8BALL_ANSWER"]}`, value: answer }).setColor("#807fff")] });
    }
}