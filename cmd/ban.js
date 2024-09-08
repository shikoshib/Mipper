const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a member")
        .setDescriptionLocalization("ru", "Забанить участника")
        .setNameLocalization("ru", "бан")
        .addUserOption(opt => opt
            .setName("member")
            .setNameLocalization("ru", "участник")
            .setDescription("A member to ban")
            .setDescriptionLocalization("ru", "Участник, которого нужно забанить")
            .setRequired(true))
        .addStringOption(opt => opt
            .setName("reason")
            .setNameLocalization("ru", "причина")
            .setDescription("A reason for banning a member")
            .setDescriptionLocalization("ru", "Причина бана")
            .setMaxLength(512)
            .setRequired(false)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let target = interaction.guild.members.cache.get(interaction.options.getUser("member").id);
        let reason = interaction.options.getString("reason");

        if (!interaction.guild.members.cache.get(interaction.user.id).permissions.has("BAN_MEMBERS")) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["NO_PERMS"])] });
        if (!target) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["NO_MEMBER"])] });
        if (target.user.id == interaction.user.id) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["BAN_YOURSELF"])] });
        if (!target.bannable) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(`${langFile["CANT_BAN"]} **${target.displayName}**!`)] });

        try {
            const banEmbed = new MessageEmbed()
                .setTitle(`✅ ${langFile["DONE"]}`)
                .setDescription(`**${target.displayName}** ${langFile["BAN_SUCCESS"]}`)
                .setColor("#807fff");
            if (reason) banEmbed.addField(langFile["BAN_REASON"], `\`\`\`${reason}\`\`\``);

            target.ban({ reason: reason }).then(() => {
                return interaction.editReply({ embeds: [banEmbed] })
            })

            const DMBanEmbed = new MessageEmbed()
                .setTitle(`${langFile["BAN_FROM"]} ${interaction.guild.name}`)
                .setDescription(`${langFile["BAN_BY"]} \`${interaction.user.tag.endsWith("#0") ? interaction.user.username : interaction.user.tag}\`${reason ? `\n${langFile["BAN_REASON"]}: \`\`\`${reason}\`\`\`` : ""}`)
                .setColor("#807fff")

            target.user.send({ embeds: [DMBanEmbed] }).catch(error => {
                return;
            })
        } catch (err) {
            return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(`${langFile["WHOOPS_ERR"]}\n\`\`\`${err}\`\`\``).setColor("#807fff")] })
        }
    }
}