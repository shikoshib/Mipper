const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("warns")
        .setDescription("Get the list of a member's warns")
        .setDescriptionLocalization("ru", "Просмотреть предупреждения участника")
        .setNameLocalization("ru", "варны")
        .addUserOption(opt => opt
            .setName("member")
            .setNameLocalization("ru", "участник")
            .setDescription("A member to get the list of warnings from")
            .setDescriptionLocalization("ru", "Участник, чей список предупреждений нужно просмотреть")
            .setRequired(false)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let target = interaction.options.getUser("member");
        if (!target) {
            target = interaction.member;
        } else {
            target = interaction.guild.members.cache.get(target.id);
        }

        const serverWarnsFile = fs.existsSync(__dirname + `/../db/warns/${interaction.guild.id}.json`) ?
            JSON.parse(fs.readFileSync(__dirname + `/../db/warns/${interaction.guild.id}.json`).toString()) : [];
        const memberWarns = serverWarnsFile.filter(w => w.member == target.id);

        let embed = new MessageEmbed()
            .setTitle(`:warning: ${langFile["WARN_LIST"].replace("{{member}}", target.displayName)}`)
            .setColor("#807fff")

        if (!memberWarns.length) {
            embed.setDescription(langFile["WARN_NOLIST"].replace("{{member}}", target.displayName));
            return interaction.editReply({ embeds: [embed] });
        }

        for (let i = 0; i < memberWarns.length; i++) {
            const warn = memberWarns[i];
            let expireText = "";
            if (warn.timestamp != "Infinity") expireText = `${langFile["WARN_EXPIRE"]} <t:${Math.round(warn.timestamp / 1000)}:D> (<t:${Math.round(warn.timestamp / 1000)}:R>)`;

            let reasonText = warn.reason ? `\`\`\`${warn.reason}\`\`\`` : "```N/A```";
            embed.addField(`${langFile["WARN"]} #${i + 1}`, `${reasonText}${expireText}`)
        }

        return interaction.editReply({ embeds: [embed] });
    }
}