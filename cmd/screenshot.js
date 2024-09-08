const { SlashCommandBuilder } = require("@discordjs/builders");
const puppeteer = require('puppeteer');
const fs = require("fs");
const { performance } = require('perf_hooks');
module.exports = {
  data: new SlashCommandBuilder()
    .setName("screenshot")
    .setNameLocalization("ru", "скриншот")
    .setDescription("Take a screenshot of a website")
    .setDescriptionLocalization("ru", "Сделать скриншот сайта")
    .addStringOption(opt => opt
      .setName("url")
      .setNameLocalization("ru", "ссылка")
      .setDescription("The URL of a website to take screenshot of")
      .setDescriptionLocalization("ru", "Ссылка, скриншот которой нужно сделать")
      .setRequired(true))
    .addNumberOption(opt => opt
      .setName("width")
      .setNameLocalization("ru", "ширина")
      .setDescription("The screenshot width")
      .setDescriptionLocalization("ru", "Ширина скриншота")
      .setMinValue(1)
      .setMaxValue(8000)
      .setRequired(false))
    .addNumberOption(opt => opt
      .setName("height")
      .setNameLocalization("ru", "высота")
      .setDescription("The screenshot height")
      .setDescriptionLocalization("ru", "Высота скриншота")
      .setMinValue(1)
      .setMaxValue(8000)
      .setRequired(false)),
  async execute({ client, interaction }) {
    const url = interaction.options.getString("url");
    const w = interaction.options.getNumber("width") || 1920;
    const h = interaction.options.getNumber("height") || 1080;
    let alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let scrID = "";
    for (let i = 0; i < 12; i++) {
      let randomLetter = Math.round(Math.random() * (alphabet.length - 1));
      scrID += alphabet[randomLetter];
    }
    let start = performance.now();
    try {
      const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'], defaultViewport: { width: w, height: h } });
      const page = await browser.newPage();
      await page.goto(url);
      await page.screenshot({ path: __dirname + `/../screenshots/${scrID}.png` });
      await browser.close();
    } catch (e) {
      return interaction.editReply({ content: `\u274c **Error:** \`${e}\`` })
    }
    let end = performance.now();
    await interaction.editReply({
      content: `Took ${((end - start) / 1000).toFixed(2)} seconds.`,
      files: [{
        attachment: fs.readFileSync(__dirname + `/../screenshots/${scrID}.png`),
        name: "screenshot.png"
      }], embeds: []
    })
    fs.unlinkSync(__dirname + `/../screenshots/${scrID}.png`);
  }
}