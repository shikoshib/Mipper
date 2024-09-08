const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setNameLocalization("ru", "участник")
        .setDescription("Get the info about a user")
        .setDescriptionLocalization("ru", "Просмотреть информацию об участнике")
        .addUserOption(opt => opt
            .setName("user")
            .setNameLocalization("ru", "пользователь")
            .setDescription("A user to get info about")
            .setDescriptionLocalization("ru", "Участник, о котором нужно просмотреть информацию")
            .setRequired(false)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let target = interaction.options.getUser("user");
        if (!target) target = interaction.user;

        let targetMember = interaction.guild.members.cache.get(target.id);

        const created = Math.trunc(Number(target.createdTimestamp) / 1000);
        const joined = Math.trunc(Number(targetMember.joinedTimestamp) / 1000);

        let presence = `\n**${langFile["USER_STATUS"]}** <:offline:991293636849451168>`;
        if (targetMember.presence) {
            const statuses = {
                "dnd": "<:dnd:991293667711123606>",
                "idle": "<:idle:991294975998427146>",
                "online": "<:online:991293591404163082>"
            }

            let platforms = langFile["PLATFORMS"];

            presence = `\n**${langFile["USER_STATUS"]}** ${statuses[targetMember.presence.status]}`;
            Object.keys(platforms).forEach(key => {
                if (targetMember.presence.clientStatus[key]) {
                    presence += ` (${platforms[key]})`;
                }
            })

            let ACTIVITY_TYPES = langFile["ACTIVITY_TYPES"];

            presence += `\n\n`;
            for (const activity of targetMember.presence.activities) {
                let type = activity.type.toLowerCase();
                if (type == "custom") continue;
                presence += `**${ACTIVITY_TYPES[activity.type]}** ${activity.name}\n${langFile["USER_STARTED"]} ${langFile["ACTIVITY_TYPES_STARTED"][activity.type]} <t:${Math.trunc(Number(activity.createdTimestamp) / 1000)}:R>\n\n`
            }
        }

        const embed = new MessageEmbed()
            .setTitle(`${langFile["GD_INFO_ABOUT"]} ${targetMember.displayName}`)
            .setThumbnail(target.displayAvatarURL({ format: "png", dynamic: true, size: 1024 }))
            .setColor("#807fff")
            .setDescription(`${langFile["USER_INFO"].replaceAll("{{username}}", `${target.discriminator == "0" ? target.username : target.tag}${target.bot ? " <:en_bot:1134660246208532621>" : ""} ${targetMember.nickname ? `(\`${targetMember.nickname}\`)` : ""}`).replaceAll("{{id}}", target.id).replaceAll("{{created}}", `<t:${created}:D>`).replaceAll("{{joined}}", `<t:${joined}:D>`)}${presence}`)
        //.setDescription(`**Username:** ${target.discriminator == "0" ? target.username : target.tag}${target.bot ? " <:en_bot:1134660246208532621>" : ""} ${targetMember.nickname ? `(\`${targetMember.nickname}\`)` : ""}\n**ID:** ${target.id}\n**Joined Discord** on <t:${created}:D>\n**Joined this server** on <t:${joined}:D>${presence}`)
        return interaction.editReply({ embeds: [embed] });
    }
}