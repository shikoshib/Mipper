const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setNameLocalization("ru", "кик")
        .setDescription("kick a member")
        .setDescriptionLocalization("ru", "Кикнуть участника")
        .addUserOption(opt => opt
            .setName("member")
            .setNameLocalization("ru", "участник")
            .setDescription("A member to kick")
            .setDescriptionLocalization("ru", "Участник, которого нужно кикнуть")
            .setRequired(true))
        .addStringOption(opt => opt
            .setName("reason")
            .setNameLocalization("ru", "причина")
            .setDescription("A reason for kicking a member")
            .setDescriptionLocalization("ru", "Причина кика")
            .setMaxLength(512)
            .setRequired(false)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let target = interaction.guild.members.cache.get(interaction.options.getUser("member").id);
        let reason = interaction.options.getString("reason");

        if (!interaction.guild.members.cache.get(interaction.user.id).permissions.has("KICK_MEMBERS")) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["NO_PERMS"])] });
        if (!target) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["NO_MEMBER"])] });
        if (target.user.id == interaction.user.id) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["KICK_YOURSELF"])] });
        if (!target.kickable) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(`${langFile["CANT_KICK"]} **${target.displayName}**!`)] });

        try {
            target.kick({ reason: reason }).then(() => {
                return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`✅ ${langFile["DONE"]}`).setDescription(`**${target.displayName}** ${langFile["KICK_SUCCESS"]}`).setColor("#807fff").addField(langFile["KICK_REASON"], `\`\`\`${reason}\`\`\``)] })
            })
            target.user.send({ embeds: [new MessageEmbed().setTitle(`${langFile["KICK_FROM"]} ${interaction.guild.name}`).setDescription(`${langFile["KICK_BY"]} \`${interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag}\`\n${langFile["KICK_REASON"]}: \`\`\`${reason}\`\`\``).setColor("#807fff")] }).catch(error => {
                return;
            })
        } catch (err) {
            return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(`${langFile["WHOOPS_ERR"]}\n\`\`\`${err}\`\`\``).setColor("#807fff")] })
        }
    }
}