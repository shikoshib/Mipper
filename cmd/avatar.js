const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Get a user's profile picture")
        .setDescriptionLocalization("ru", "Получить аватарку пользователя")
        .setNameLocalization("ru", "аватар")
        .addUserOption((opt) => opt
            .setName("user")
            .setNameLocalization("ru", "пользователь")
            .setDescription("The user to get avatar from")
            .setDescriptionLocalization("ru", "Пользователь, чью аватарку нужно получить")
            .setRequired(false)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let user = interaction.options.getUser("user");
        if (!user) {
            user = interaction.member;
        } else {
            user = interaction.guild.members.cache.get(user.id);
        }

        if (!user) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setImage("Couldn't find this member").setColor("#807fff")] });

        let img = user.displayAvatarURL({ format: "png", dynamic: true, size: 1024 });
        let title = langFile["AVATAR_TITLE"].replaceAll("{{name}}", user.displayName);
        interaction.editReply({ embeds: [new MessageEmbed().setTitle(title).setImage(img).setColor("#807fff")] });
    }
}