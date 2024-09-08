const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const mathjs = require("mathjs");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("math")
        .setNameLocalization("ru", "калькулятор")
        .setDescription("Evaluate a math expression")
        .setDescriptionLocalization("ru", "Решить математический пример")
        .addStringOption(opt => opt
            .setName("expression")
            .setDescription("The expression to evaluate")
            .setDescriptionLocalization("ru", "Пример для решения")
            .setRequired(true)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let expression = interaction.options.getString("expression");
        try {
            var result = mathjs.evaluate(expression);
            if (expression.includes("/") && [Infinity,NaN].includes(result)) throw new Error(langFile["ZERO_DIV"]);
            interaction.editReply({ embeds: [new MessageEmbed().setTitle(`✅ ${langFile["MATH_RESULT"]}:`).setDescription(`\`\`\`${mathjs.format(result, { precision: 14 }).replace(Infinity, "∞")}\`\`\``).setColor("#807fff")] })
        } catch (err) {
            interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(`\`\`\`${err.message}\`\`\``).setColor("#807fff")] })
        }
    }
}