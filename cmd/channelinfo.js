const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("channelinfo")
        .setNameLocalization("ru", "канал")
        .setDescription("Get the info about a channel")
        .setDescriptionLocalization("ru", "Получить информацию о канале")
        .addChannelOption((opt) => opt
            .setName("channel")
            .setNameLocalization("ru", "канал")
            .setDescription("The channel to get info about")
            .setDescriptionLocalization("ru", "Канал, о котором нужно получить информацию")
            .setRequired(false)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`);

        let channel = interaction.options.getChannel("channel");
        if (!channel) channel = interaction.channel;
        const types = langFile["CHANNEL_TYPES"];
        const { userLimit, name, id, createdTimestamp, type, bitrate, topic, nsfw } = channel;
        let limit = langFile["NO_LIMIT"];
        let additionalInfo = "";

        let membersWord = "";
        if (userLimit) {
            if (langDb[interaction.guild.id] == "ru") {
                if (userLimit.toString().endsWith("1") && !userLimit.toString().endsWith("11")) {
                    membersWord = "участник";
                } else if (userLimit.toString().endsWith("2") && !userLimit.toString().endsWith("12") ||
                    userLimit.toString().endsWith("3") && !userLimit.toString().endsWith("13") ||
                    userLimit.toString().endsWith("4") && !userLimit.toString().endsWith("14")
                ) {
                    membersWord = "участника";
                } else {
                    membersWord = "участников";
                }
            } else {
                if (userLimit.toString().endsWith("1") && !userLimit.toString().endsWith("11")) {
                    membersWord = "member";
                } else {
                    membersWord = "members";
                }
            }
        }

        if (userLimit != 0) limit = `${userLimit} ${membersWord}`
        if (type == "GUILD_VOICE") additionalInfo = `${langFile["BITRATE"]}: ${bitrate / 1000} ${langFile["KBIT_S"]}\n${langFile["CHANNELINFO_LIMIT"]}: ${limit}`;
        if (type == "GUILD_STAGE_VOICE") additionalInfo = `${langFile["BITRATE"]}: ${bitrate / 1000} ${langFile["KBIT_S"]}\n${langFile["CHANNELINFO_LIMIT"]}: ${limit}\n${langFile["TOPIC"]}: ${topic ? `"**${topic}**"` : langFile["NO_LIMIT"]}`;
        if (type == "GUILD_NEWS" && topic || type == "GUILD_FORUM" && topic) additionalInfo = `${langFile["TOPIC"]}: "**${topic}**"`;
        interaction.editReply({ embeds: [new MessageEmbed().setTitle(`#${name}`).setColor("#807fff").setDescription(`${nsfw ? `${langFile["NSFW_WARN"]}\n\n` : ""}${langFile["CHANNELINFO_DESC"].replaceAll("{{name}}", name).replaceAll("{{id}}", id).replaceAll("{{time}}", `<t:${Math.trunc(createdTimestamp / 1000)}:D>`).replaceAll("{{type}}", types[type])}\n\n${additionalInfo}`)] })
    }
}