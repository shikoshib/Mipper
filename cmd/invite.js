const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("invite")
        .setNameLocalization("ru", "приглашение")
        .setDescription("Create an invite link to a channel")
        .setDescriptionLocalization("ru", "Создать ссылку-приглашение на канал")
        .addChannelOption((opt) => opt
            .setName("channel")
            .setNameLocalization("ru", "канал")
            .setDescription("The channel to create invite link to")
            .setDescriptionLocalization("ru", "Канал, на который нужно создать ссылку-приглашение")
            .setRequired(false)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let channel = interaction.options.getChannel("channel");
        if (!channel) channel = interaction.channel;
        if (!interaction.guild.members.cache.get(client.user.id).permissions.has("CREATE_INSTANT_INVITE")) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setColor("#807fff").setDescription(`I can't create invite links!`)] });
        try {
            channel.createInvite({ maxAge: 0, maxUses: 0 }).then((invite) => {
                interaction.editReply({ embeds: [new MessageEmbed().setTitle(`✅ ${langFile["DONE"]}`).setColor("#807fff").setDescription(`${langFile["INVITE_LINK"]} ${invite}\n${langFile["INVITE_CHANNEL"]} <#${channel.id}>`)] });
            });
        } catch (err) {
            interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setColor("#807fff").setDescription(`\`${err}\``)] });
        }
    }
}