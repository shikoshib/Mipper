const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const Canvas = require("canvas");
const fs = require("fs");
const { LevelInfo } = require("../LevelInfo");
const levels = new LevelInfo();
const levelEnabledArray = JSON.parse(fs.readFileSync(__dirname + "/../db/lvl-enabled.json").toString());

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rank")
        .setNameLocalization("ru", "ранг")
        .setDescription("Shows rank of a specified member")
        .setDescriptionLocalization("ru", "Показывает ранг указанного участника")
        .addUserOption((opt) => opt
            .setName("member")
            .setNameLocalization("ru", "участник")
            .setDescription("The member to get the rank of")
            .setDescriptionLocalization("ru", "Участник, чей ранг нужно получить")
            .setRequired(false)),
    async execute({ client, interaction }) {
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`);
        
        if(!levelEnabledArray.includes(interaction.guild.id)) return interaction.editReply({ embeds:[new MessageEmbed().setColor("#807fff").setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["LVL_DISABLED"])]});

        const user = interaction.options.getUser("member") || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        const levelingInfo = JSON.parse(fs.readFileSync(__dirname + `/../db/levels/${interaction.guild.id}.json`).toString());
        let userLvlInfo = levelingInfo[user.id];
        if (!userLvlInfo) userLvlInfo = { xp: 0 };
        const canvas = Canvas.createCanvas(1200, 320);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#131313";
        ctx.fillRect(0, 0, 1200, 320);

        const gradient = ctx.createLinearGradient(0, 0, 0, 320);
        gradient.addColorStop(0, "#a5a5ff");
        gradient.addColorStop(0.5, "#807fff");
        gradient.addColorStop(1, "#5959ff");

        ctx.fillStyle = gradient;
        ctx.globalAlpha = .333;
        ctx.fillRect(0, 0, 1200, 320);
        ctx.globalAlpha = 1;

        Canvas.registerFont(__dirname + "/../SF-Pro-Display-Regular.otf", { family: "SF_Pro_Display_Regular" });
        Canvas.registerFont(__dirname + "/../SF-Pro-Display-Light.otf", { family: "SF_Pro_Display_Light" });

        const XP = userLvlInfo.xp;
        const level = levels.getLevelFromXP(XP);
        const maxXP = levels.getMaxXP(level);
        let maxXPPrev = levels.getMaxXP(level - 1);
        if (maxXPPrev < 0) maxXPPrev = 0;
        const username = member.displayName;

        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.shadowColor = "rgba(0,0,0,.75)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(160, 160, 128, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        const pfpURL = user.displayAvatarURL({ format: "png", dynamic: true, size: 256 });
        const pfp = await Canvas.loadImage(pfpURL);
        ctx.save();
        ctx.beginPath();
        ctx.arc(160, 160, 128, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(pfp, 32, 32, 256, 256);
        ctx.closePath();
        ctx.restore();

        ctx.shadowColor = null;
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(127,127,255,0.175)";

        function drawRoundedRect(x, y, w, h, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.fill();
            ctx.closePath();
        }

        drawRoundedRect(320, canvas.height - 96, 848, 64, 24);

        let progressWidth = Math.round(((XP - maxXPPrev) / (maxXP - maxXPPrev)) * 848);
        if (progressWidth < 48) progressWidth = 48;

        ctx.shadowColor = "rgba(0,0,0,.5)";
        ctx.shadowBlur = 6;
        ctx.fillStyle = "#807fff";
        drawRoundedRect(320, canvas.height - 96, progressWidth, 64, 24);

        ctx.shadowColor = "rgba(0,0,0,.5)";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#ffffff";

        ctx.font = "32px SF_Pro_Display_Regular";
        const xpText = `${XP} / ${maxXP} XP`;
        const xpTextWidth = ctx.measureText(xpText).width;
        ctx.fillText(xpText, canvas.width - 32 - xpTextWidth, canvas.height - 112);

        ctx.font = "40px SF_Pro_Display_Regular";
        const lvlText = `${langFile["LEVEL"]} ${level}`;
        ctx.fillText(lvlText, 320, canvas.height - 112);

        ctx.shadowColor = "rgba(0,0,0,.75)";
        ctx.font = "80px SF_Pro_Display_Light";
        let usernameTrim = "";
        for (let char of username) {
            if (ctx.measureText(usernameTrim).width > 768) {
                usernameTrim += "...";
                break;
            }
            usernameTrim += char;
        }
        ctx.fillText(usernameTrim, 320, canvas.height - 192);

        return interaction.editReply({
            files: [{
                attachment: canvas.toBuffer(),
                name: "rank.png"
            }], embeds: []
        })
    }
}