const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cat")
        .setNameLocalization("ru", "кот")
        .setDescription("Get a random cat picture")
        .setDescriptionLocalization("ru", "Получить случайную картинку с котиками"),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        let req = await fetch("https://cataas.com/cat");
        function toBuffer(arrayBuffer) {
            const buffer = Buffer.alloc(arrayBuffer.byteLength);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < buffer.length; ++i) {
                buffer[i] = view[i];
            }
            return buffer;
        }
        try {
            let arrBuff = await req.arrayBuffer();
            let buffer = toBuffer(arrBuff);
            interaction.editReply({ content: "||\n||", files: [{ attachment: buffer, name: "cat.jpg" }] });
        } catch (e) {
            interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["SMTH_WRONG"]).setColor("#807fff")] });
        }
    }
}