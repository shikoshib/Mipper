const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const { LevelInfo } = require("../LevelInfo");
const levels = new LevelInfo();
const levelEnabledArray = JSON.parse(fs.readFileSync(__dirname + "/../db/lvl-enabled.json").toString());

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaders")
        .setNameLocalization("ru", "лидеры")
        .setDescription("Shows the server-wide leaderboard based on rank")
        .setDescriptionLocalization("ru", "Показывает таблицу лидеров всего сервера по рангу")
        .addNumberOption(opt => opt
            .setName("page")
            .setNameLocalization("ru", "страница")
            .setDescription("The leaderboard page")
            .setDescriptionLocalization("ru", "Страница таблицы лидеров")
            .setMinValue(1)
            .setRequired(false)),
    async execute({ client, interaction }) {
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`);

        const cache = JSON.parse(fs.readFileSync(__dirname + `/../cache/guilds/${interaction.guild.id}.json`).toString());

        const page = interaction.options.getNumber("page") || 1;

        function chunkArray(array, chunkSize) {
            const chunks = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                chunks.push(array.slice(i, i + chunkSize));
            }
            return chunks;
        }

        if (!levelEnabledArray.includes(interaction.guild.id)) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["LVL_DISABLED"])] });

        const members = JSON.parse(fs.readFileSync(__dirname + `/../db/levels/${interaction.guild.id}.json`).toString());
        let leaderboard = Object.keys(members).filter(a => a != "info").sort((a, b) => members[b].xp - members[a].xp);
        for (let member of leaderboard) {
            if (!cache.filter(m => m.id == member)[0]) leaderboard = leaderboard.filter(m => m != member);
        }

        const chunks = chunkArray(leaderboard, 10);

        const embed = new MessageEmbed()
            .setTitle(langFile["LEADERBOARD"].replaceAll("{{name}}", interaction.guild.name))
            .setThumbnail(interaction.guild.iconURL({ format: "png", dynamic: true, size: 1024 }))
            .setColor("#807fff");

        let fields = [];
        let i = 1;

        const pageAddition = (page - 1) * 10;
        for (let memberID of chunks[page - 1]) {
            const xp = members[memberID].xp;
            const member = cache.filter(m => m.id == memberID)[0];
            fields.push({
                name:
                    `${i + pageAddition}. ${member.name}`,
                value: `**${langFile["LEVEL"]}** ${levels.getLevelFromXP(xp)} | **XP:** ${xp}`
            })
            i++;
        }

        embed.addFields(fields);

        return interaction.editReply({ embeds: [embed] });
    }
}