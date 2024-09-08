const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setNameLocalization("ru", "очистить")
        .setDescription("Clear messages in a channel")
        .setDescriptionLocalization("ru", "Очистить сообщения в канале")
        .addNumberOption(opt => opt
            .setName("amount")
            .setNameLocalization("ru", "количество")
            .setDescription("The amount of messages to delete")
            .setDescriptionLocalization("ru", "Количество сообщений, которые нужно удалить")
            .setMaxValue(100)
            .setMinValue(1)
            .setRequired(true))
        .addChannelOption(opt => opt
            .setName("channel")
            .setNameLocalization("ru", "канал")
            .setDescription("The channel to delete messages in")
            .setDescriptionLocalization("ru", "Канал, в котором удалить сообщения")
            .setRequired(false)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let amount = interaction.options.getNumber("amount");
        let channel = interaction.options.getChannel("channel");
        if (!channel) channel = interaction.channel;

        if (!interaction.member.permissions.has("MANAGE_MESSAGES")) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription("You don't have enough permissions").setColor("#807fff")] });
        const clientMember = interaction.guild.members.cache.get(client.user.id);
        if (!clientMember.permissions.has("MANAGE_MESSAGES")) return;

        let messageWord = "";
        if (amount.toString().endsWith("1") && !amount.toString().endsWith("11")) {
            messageWord = langFile["CLEAR_MESSAGE"];
        } else {
            messageWord = langFile["CLEAR_MESSAGES"];
        }

        await channel.messages.fetch({
            limit: amount
        }).then(async messages => {
            await channel.bulkDelete(messages, true).then(() => {
                return interaction.channel.send({ content: `<@${interaction.user.id}>`, embeds: [new MessageEmbed().setTitle(`✅ ${langFile["DELETE_SUCCESS"]} ${amount} ${messageWord}`).setColor("#807fff").setDescription(langFile["CLEAR_MSG_INFO"])] })
            });
        })
    }
}