const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("b64")
        .setDescription('Commands to work with Base64')
        .setDescriptionLocalization("ru", "Команды для работы с Base64")
        .addSubcommand(subcommand =>
            subcommand
                .setName('decode')
                .setNameLocalization("ru", "расшифровать")
                .setDescription('Decode from Base64')
                .setDescriptionLocalization("ru", "Расшифровать из Base64")
                .addStringOption(option => option
                    .setName('b64')
                    .setDescription('The Base64 string to decode')
                    .setDescriptionLocalization("ru", 'Строка Base64 для расшифровки')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('encode')
                .setNameLocalization("ru", "зашифровать")
                .setDescription('Encode to Base64')
                .setDescriptionLocalization("ru", "Зашифровать в Base64")
                .addStringOption(option => option
                    .setName('text')
                    .setNameLocalization("ru", "текст")
                    .setDescription('The text to encode to Base64')
                    .setDescriptionLocalization("ru", 'Текст для зашифровки в Base64')
                    .setRequired(true))),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        if (interaction.options.getSubcommand() == 'decode') {
            const b64Str = interaction.options.getString('b64');
            function decB64(string) {
                return decodeURIComponent(escape(atob(string.replaceAll("_", '/').replaceAll("-", '+'))));
            }
            try {
                let string = decB64(b64Str);
                await interaction.editReply({ embeds: [new MessageEmbed().setTitle(`✅ ${langFile["DONE"]}`).setDescription(string).setColor("#807fff")] });
            } catch (e) {
                await interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(`\`${e}\``).setColor("#807fff")] });
            }
        } else if (interaction.options.getSubcommand() == 'encode') {
            const string = interaction.options.getString('text');
            function encB64(string) {
                return btoa(unescape(encodeURIComponent(string))).replace(/\//g, '_').replace(/\+/g, '-');
            }
            try {
                let b64 = encB64(string);
                await interaction.editReply({ embeds: [new MessageEmbed().setTitle(`✅ ${langFile["DONE"]}`).setDescription(b64).setColor("#807fff")] });
            } catch (e) {
                await interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(`\`${e}\``).setColor("#807fff")] });
            }
        }
    }
}