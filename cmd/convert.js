const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const { exec } = require("node:child_process");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("convert")
        .setNameLocalization("ru", "конвертер")
        .setDescription("Convert media files")
        .setDescriptionLocalization("ru", "Сконвертировать медиафайлы")
        .addSubcommand(sub =>
            sub
                .setName("audio")
                .setNameLocalization("ru", "аудио")
                .setDescription("Convert an audio file")
                .setDescriptionLocalization("ru", "Сконвертировать аудиофайл")
                .addAttachmentOption(option => option
                    .setName('file')
                    .setNameLocalization("ru", 'файл')
                    .setDescription('The audio file to convert')
                    .setDescriptionLocalization("ru", 'Файл, который нужно сконвертировать')
                    .setRequired(true))
                .addStringOption(option => option
                    .setName('type')
                    .setNameLocalization("ru", 'формат')
                    .setDescription('The file type to convert to')
                    .setDescriptionLocalization("ru", 'Формат, в который нужно сконвертировать')
                    .setRequired(true)
                    .addChoices(
                        { name: '.mp3', value: 'mp3' },
                        { name: '.flac', value: 'flac' },
                        { name: '.wav', value: 'wav' },
                        { name: '.ogg', value: 'ogg' },
                        { name: '.aac', value: 'aac' }
                    ))
                .addNumberOption(option => option
                    .setName('bitrate')
                    .setNameLocalization("ru", 'битрейт')
                    .setDescription('The output file bitrate (defaults to the original bitrate)')
                    .setDescriptionLocalization("ru", 'Конечный битрейт (по умолчанию оригинальный битрейт)')
                    .setRequired(false)
                    .setMinValue(32)
                    .setMaxValue(320))
                .addStringOption(option => option
                    .setName('sample_rate')
                    .setNameLocalization("ru", 'частота_дискретизации')
                    .setDescription('The output file sample rate (defaults to the original sample rate)')
                    .setDescriptionLocalization("ru", 'Конечный битрейт (по умолчанию оригинальный битрейт)')
                    .setRequired(false)
                    .addChoices(
                        { name: '8000 Hz', value: "8000" },
                        { name: '11025 Hz', value: "11025" },
                        { name: '22050 Hz', value: "22050" },
                        { name: '32000 Hz', value: "32000" },
                        { name: '44100 Hz', value: "44100" },
                        { name: '48000 Hz', value: "48000" }
                    ))),
    async execute({ client, interaction }) {
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`);

        const attachment = interaction.options.getAttachment("file");
        const type = interaction.options.getString("type");

        let bitrate = interaction.options.getNumber("bitrate");
        let sampleRate = interaction.options.getString("sample_rate");

        let alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        let auID = "";
        for (let i = 0; i < 12; i++) {
            let randomLetter = Math.round(Math.random() * (alphabet.length - 1));
            auID += alphabet[randomLetter];
        }

        const attachmentURL = attachment.proxyURL;
        const url = new URL(attachmentURL);
        function cleanup() {
            try {
                fs.unlinkSync(`${__dirname}/../audio/${auID}.${url.pathname.split(".")[1]}`); // original file
                fs.unlinkSync(`${__dirname}/../audio/${auID}-c.${type}`); // output file
                fs.unlinkSync(`${__dirname}/../audio/${auID}.json`); // ffprobe
            } catch (e) {
                // sure whatever
            }
        }
        await fetch(attachmentURL).then(async (a) => {
            const arrbuf = await a.arrayBuffer();
            fs.writeFileSync(`${__dirname}/../audio/${auID}.${url.pathname.split(".")[1]}`, Buffer.from(arrbuf));

            await interaction.editReply({
                embeds: [new MessageEmbed().setTitle(`⏳ ${langFile["CONVERTING"]}`).setColor("#807fff")]
            })

            exec(`ffprobe "${__dirname}/../audio/${auID}.${url.pathname.split(".")[1]}" -print_format json -show_format -show_streams > "${__dirname}/../audio/${auID}.json"`, async (err, stdout, stderr) => {
                if (err) {
                    cleanup();
                    if (err.message.includes("low score of 1")) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["AUDIOFILE_INVALID"]).setColor("#807fff")] });
                    return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(`${err}`).setColor("#807fff")] });
                }

                const ffprobe = require(`${__dirname}/../audio/${auID}.json`);
                const originalBitrate = Number(ffprobe.format.bit_rate);
                const duration = Number(ffprobe.streams[0].duration);
                if (!bitrate) bitrate = Math.round(originalBitrate / 1000);
                if (!sampleRate) sampleRate = ffprobe.streams[0].sample_rate;

                if (type == "wav") bitrate = 1411.3;
                if (type == "flac") bitrate = 1730.3;
                if (bitrate > 1000 && (type == "mp3" || type == "ogg")) bitrate = 320;
                const approxFileSize = (bitrate * 1000 / 8) * duration;
                if (approxFileSize > 26214400) {
                    cleanup();
                    return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["AUDIOFILE_OVER25"]).setColor("#807fff")] });
                }

                let cmd = `ffmpeg -i "${__dirname}/../audio/${auID}.${url.pathname.split(".")[1]}" -b:a ${bitrate}k`;
                if (sampleRate) cmd += ` -ar ${sampleRate}`;
                cmd += ` "${__dirname}/../audio/${auID}-c.${type}"`;

                exec(cmd, async (err, stdout, stderr) => {
                    if (err) {
                        cleanup();
                        return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(`${err}`).setColor("#807fff")] });
                    }

                    await interaction.editReply({
                        embeds: [new MessageEmbed().setTitle(`⏳ ${langFile["CONVERSION_DONE"]}`).setColor("#807fff")]
                    })

                    interaction.editReply({
                        files: [{
                            attachment: fs.readFileSync(__dirname + `/../audio/${auID}-c.${type}`),
                            name: `${url.pathname.split(".")[0].split("/")[url.pathname.split(".")[0].split("/").length - 1]}.${type}`
                        }], embeds: []
                    })
                    cleanup();
                    return;
                });
            });
        })
    }
}