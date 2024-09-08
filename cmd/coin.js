const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coin")
        .setNameLocalization("ru", "монета")
        .setDescription("Flip a coin")
        .setDescriptionLocalization("ru", "Подбросить монету"),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        var coin = langFile["COIN_FLIP"];
        var coinResult = coin[Math.floor(Math.random() * (coin.length))];
        const embed = new MessageEmbed()
            .setTitle(`⏳ ${langFile["COIN_FLIPPING"]}`)
            .setColor("#807fff");
        interaction.editReply({ embeds: [embed] });
        function sendRes() {
            const res = new MessageEmbed()
                .setTitle(coinResult)
                .setColor("#807fff");
            interaction.editReply({ embeds: [res] });
        }
        setTimeout(sendRes, 1000)
    }
}