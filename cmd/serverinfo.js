const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setNameLocalization("ru", "сервер")
        .setDescription("Get the info about this server")
        .setDescriptionLocalization("ru", "Просмотреть информацию об этом сервере"),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        const verificationLevels = langFile["VERIFICATION_LEVELS"];
        const guild = interaction.guild;
        let icon = guild.iconURL({ format: "png", dynamic: true, size: 1024 });
        let { name, description, id, members, ownerId, verificationLevel, createdTimestamp, memberCount, channels, stickers, roles, emojis, premiumSubscriptionCount } = guild;

        let ownerTag = members.cache.get(ownerId).user.tag;
        if (ownerTag.endsWith("#0")) ownerTag = members.cache.get(ownerId).user.username;

        let totalChannelsSize = channels.cache.filter(c => c.type == "GUILD_TEXT").size + channels.cache.filter(c => c.type == "GUILD_FORUM").size + channels.cache.filter(c => c.type == "GUILD_NEWS").size + channels.cache.filter(c => c.type == "GUILD_VOICE").size + channels.cache.filter(c => c.type == "GUILD_STAGE_VOICE").size;

        let embed = new MessageEmbed()
            .setTitle(`${langFile["GD_INFO_ABOUT"]} ${name}`)
            .setColor("#807fff")
            .setThumbnail(icon)
            .setDescription(langFile["SERVERINFO_DESC"].replaceAll("{{name}}", name).replaceAll("{{description}}", description ? `**${langFile["SERVERINFO_DESCRIPTION"]}:** \`${description}\`\n` : "").replaceAll("{{id}}", id).replaceAll("{{owner}}", ownerTag).replaceAll("{ownerid}", ownerId).replaceAll("{{verificationLevel}}", verificationLevels[verificationLevel]).replaceAll("{{created}}", `<t:${parseInt(createdTimestamp / 1000)}:D>`).replaceAll("{{memberCount}}", memberCount).replaceAll("{{channels}}", totalChannelsSize).replaceAll("{{text}}", channels.cache.filter(c => c.type == "GUILD_TEXT").size + channels.cache.filter(c => c.type == "GUILD_NEWS").size).replaceAll("{{voice}}", channels.cache.filter(c => c.type == "GUILD_VOICE").size).replaceAll("{{stage}}", channels.cache.filter(c => c.type == "GUILD_STAGE_VOICE").size).replaceAll("{{forum}}", channels.cache.filter(c => c.type == "GUILD_FORUM").size).replaceAll("{{stickers}}", stickers.cache.size).replaceAll("{{emojis}}", emojis.cache.size).replaceAll("{{roles}}", roles.cache.size).replaceAll("{{boosts}}", premiumSubscriptionCount || "0"))

        return interaction.editReply({ embeds: [embed] })
    }
}