const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rps")
        .setNameLocalization("ru", "камень-ножницы-бумага")
        .setDescription('Play rock-paper-scissors with the bot')
        .setDescriptionLocalization("ru", "Сыграть с ботом в \"камень-ножницы-бумага\"")
        .addStringOption(opt => opt
            .setName("choice")
            .setNameLocalization("ru", "выбор")
            .setDescription("Choose either rock, paper or scissors")
            .setDescriptionLocalization("ru", "Выбирайте либо камень (Rock), либо ножницы (Scissors), либо бумагу (Paper)")
            .setRequired(true)
            .addChoices(
                { name: 'Rock', value: 'rock' },
                { name: 'Scissors', value: 'scissors' },
                { name: 'Paper', value: 'paper' }
            )),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let userChoice = interaction.options.getString("choice");

        let choices = ['rock', 'scissors', 'paper']
        let botChoice = choices[Math.floor(Math.random() * (choices.length))];

        const win = new MessageEmbed()
            .setTitle(`✅ ${langFile["RPS_WIN"]}`)
            .setDescription(`${langFile["RPS_BOTS_CHOICE"]} **${langFile[botChoice.toUpperCase()]}**\n${langFile["RPS_YOUR_CHOICE"]} **${langFile[userChoice.toUpperCase()]}**`)
            .setColor("#807fff")

        const draw = new MessageEmbed()
            .setTitle(`:warning: ${langFile["RPS_DRAW"]}`)
            .setDescription(`${langFile["RPS_BOTS_CHOICE"]} **${langFile[botChoice.toUpperCase()]}**\n${langFile["RPS_YOUR_CHOICE"]} **${langFile[userChoice.toUpperCase()]}**`)
            .setColor("#807fff")

        const lose = new MessageEmbed()
            .setTitle(`❌  ${langFile["RPS_LOSE"]}`)
            .setDescription(`${langFile["RPS_BOTS_CHOICE"]} **${langFile[botChoice.toUpperCase()]}**\n${langFile["RPS_YOUR_CHOICE"]} **${langFile[userChoice.toUpperCase()]}**`)
            .setColor("#807fff")

        if (userChoice == "rock") {
            if (botChoice == "rock") return interaction.editReply({ embeds: [draw] });
            if (botChoice == "scissors") return interaction.editReply({ embeds: [win] });
            if (botChoice == "paper") return interaction.editReply({ embeds: [lose] });
        } else if (userChoice == "scissors") {
            if (botChoice == "rock") return interaction.editReply({ embeds: [lose] });
            if (botChoice == "scissors") return interaction.editReply({ embeds: [draw] });
            if (botChoice == "paper") return interaction.editReply({ embeds: [win] });
        } else if (userChoice == "paper") {
            if (botChoice == "rock") return interaction.editReply({ embeds: [win] });
            if (botChoice == "scissors") return interaction.editReply({ embeds: [lose] });
            if (botChoice == "paper") return interaction.editReply({ embeds: [draw] });
        }
    }
}