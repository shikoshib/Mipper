const { SlashCommandBuilder } = require("@discordjs/builders");
const _ = require("lodash");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reverse-text")
        .setNameLocalization("ru", "развернуть-текст")
        .setDescription("Reverse a text")
        .setDescriptionLocalization("ru", "Развернуть текст задом наперёд")
        .addStringOption(opt => opt
            .setName("text")
            .setNameLocalization("ru", "текст")
            .setDescription("The text to reverse")
            .setDescriptionLocalization("ru", "Текст, который нужно развернуть")
            .setRequired(true)),
    async execute({ client, interaction }) {
        const text = interaction.options.getString("text");
        const split = _.split(text, "");
        let reversed = "";
        for (let i = split.length; i > 0; i--) {
            reversed += split[i - 1];
        }
        return interaction.editReply({ content: reversed });
    }
}