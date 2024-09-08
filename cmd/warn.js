const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a member")
        .setDescriptionLocalization("ru", "Выдать участнику предупреждение")
        .setNameLocalization("ru", "варн")
        .addUserOption(opt => opt
            .setName("member")
            .setNameLocalization("ru", "участник")
            .setDescription("A member to warn")
            .setDescriptionLocalization("ru", "Участник, которому нужно выдать предупреждение")
            .setRequired(true))
        .addStringOption(opt => opt
            .setName("reason")
            .setNameLocalization("ru", "причина")
            .setDescription("A reason for warning a member")
            .setDescriptionLocalization("ru", "Причина")
            .setMaxLength(512)
            .setRequired(false))
        .addStringOption(opt => opt
            .setName("duration")
            .setNameLocalization("ru", "длительность")
            .setDescription("The duration of the warning")
            .setDescriptionLocalization("ru", "Длительность предупреждения")
            .setMaxLength(200)
            .setRequired(false)),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const ms = require("ms");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        const target = interaction.guild.members.cache.get(interaction.options.getUser("member").id);
        const reason = interaction.options.getString("reason");
        const duration = interaction.options.getString("duration");

        if (!interaction.guild.members.cache.get(interaction.user.id).permissions.has("MODERATE_MEMBERS")) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["WARN_NOPERMS"])] });
        if (!target) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["NO_MEMBER"])] });
        if (target.user.id == interaction.user.id) return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["WARN_SELF"])] });

        let durationMs;

        const rusMatch = /^(-?(?:\d+)?\.?\d+) *(лет?|год?|года?|г|недель?|неделя?|недели?|нед?|нд?|н|дней?|день?|дня?|д|часов?|часа?|час?|ч|минут?|минуты?|минута?|мин?|м|секунд?|секунды?|секунда?|сек?|с|миллисекунд?|миллисекунда?|миллисекунды?|миллисек?|мс)?$/i.exec(duration);
        if (rusMatch) {
            const number = parseFloat(rusMatch[1]);
            const rawType = (rusMatch[2] || 'ms').toLowerCase();
            let type;

            function parseType(t) {
                switch (t) {
                    case "лет": case "год": case "года": case "г":
                        type = "y";
                    case "недель": case "неделя": case "недели": case "нед": case "ндл": case "нд": case "н":
                        return "w";
                    case "дней": case "день": case "дня": case "д":
                        return "d";
                    case "часов": case "часа": case "час": case "ч":
                        return "h";
                    case "минут": case "минуты": case "минута": case "мин": case "м":
                        return "m";
                    case "секунд": case "секунды": case "секунда": case "сек": case "с":
                        return "s";
                    case "миллисекунд": case "миллисекунда": case "миллисекунды": case "миллисек": case "мс":
                        return "ms";
                    default:
                        return "?"
                }
            }

            durationMs = ms(`${number}${parseType(rawType)}`);
        } else {
            durationMs = ms(duration ? duration : "1?");
        }

        let warnFile = fs.existsSync(__dirname + `/../db/warns/${interaction.guild.id}.json`) ?
            JSON.parse(fs.readFileSync(__dirname + `/../db/warns/${interaction.guild.id}.json`).toString()) : [];
        const lastWarnID = Number(fs.readFileSync(__dirname + "/../db/last-warn-id.txt").toString());
        const now = new Date();

        warnFile.push({
            id: lastWarnID + 1,
            member: target.user.id,
            reason: reason,
            timestamp: durationMs ? now.getTime() + durationMs : "Infinity"
        });

        fs.writeFileSync(__dirname + "/../db/last-warn-id.txt", (lastWarnID + 1).toString());
        fs.writeFileSync(__dirname + `/../db/warns/${interaction.guild.id}.json`, JSON.stringify(warnFile));


        function removeWarn(list, id) {
            return list.filter(w => w.id != id);
        }

        if (typeof durationMs == "number") {
            setTimeout(() => {
                warnFile = removeWarn(warnFile, lastWarnID + 1);
                fs.writeFileSync(__dirname + `/../db/warns/${interaction.guild.id}.json`, JSON.stringify(warnFile));
            }, durationMs);
        }

        let embed = new MessageEmbed()
            .setTitle(`✅ ${langFile["DONE"]}`)
            .setDescription(`**${target.displayName}** ${langFile["WARN_SUCCESS"]}`)
            .setColor("#807fff");

        if (reason) embed.addField(langFile["WARN_REASON"], `\`\`\`${reason}\`\`\``)
        interaction.editReply({ embeds: [embed] });
    }
}