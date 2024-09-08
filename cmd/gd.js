const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require("discord.js");
const gd = require("gj-boomlings-api");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gd")
        .setNameLocalization("ru", "гд")
        .setDescription("Commands for interacting with Geometry Dash API.")
        .setDescriptionLocalization("ru", "Команды для взаимодействия с API Geometry Dash.")
        .addSubcommand(sub =>
            sub
                .setName("comments")
                .setNameLocalization("ru", "комментарии")
                .setDescription("Get comments on a specific Geometry Dash level")
                .setDescriptionLocalization("ru", "Просмотреть комментарии на определённом уровне в Geometry Dash")
                .addNumberOption(option => option
                    .setName('level')
                    .setNameLocalization("ru", 'уровень')
                    .setDescription('The ID of a level to get comments from')
                    .setDescriptionLocalization("ru", 'ID уровня, с которого нужно просмотреть комментарии')
                    .setRequired(true))
                .addNumberOption(option => option
                    .setName('page')
                    .setNameLocalization("ru", 'страница')
                    .setDescription('The search page')
                    .setDescriptionLocalization("ru", 'Страница просмотра')
                    .setRequired(false))
                .addStringOption(option => option
                    .setName('mode')
                    .setNameLocalization("ru", 'режим')
                    .setDescription('The mode of getting the comments')
                    .setDescriptionLocalization("ru", 'Режим просмотра комментариев')
                    .setRequired(false)
                    .addChoices(
                        { name: 'Most Popular', value: '1' },
                        { name: 'Most Recent', value: '0' }
                    )))
        .addSubcommand(sub =>
            sub
                .setName("daily")
                .setNameLocalization("ru", "ежедневный-уровень")
                .setDescription("Get the current daily level in Geometry Dash")
                .setDescriptionLocalization("ru", "Просмотреть текущий ежедневный уровень в Geometry Dash"))
        .addSubcommand(sub =>
            sub
                .setName("weekly")
                .setNameLocalization("ru", "еженедельный-демон")
                .setDescription("Get the current weekly demon in Geometry Dash")
                .setDescriptionLocalization("ru", "Просмотреть текущий еженедельный демон в Geometry Dash"))
        .addSubcommand(sub =>
            sub
                .setName("levels-by")
                .setNameLocalization("ru", "уровни-от")
                .setDescription("Search for Geometry Dash levels by a specific player")
                .setDescriptionLocalization("ru", "Поиск уровней в Geometry Dash от определённого игрока")
                .addStringOption(option => option
                    .setName('name')
                    .setNameLocalization("ru", 'запрос')
                    .setDescription('The player name or player ID')
                    .setDescriptionLocalization("ru", 'Имя игрока или ID игрока')
                    .setRequired(false))
                .addNumberOption(option => option
                    .setName('page')
                    .setNameLocalization("ru", 'страница')
                    .setDescription('The search page')
                    .setDescriptionLocalization("ru", 'Страница поиска')
                    .setRequired(false)))
        .addSubcommand(sub =>
            sub
                .setName("profile")
                .setNameLocalization("ru", "профиль")
                .setDescription("View the profile of any Geometry Dash player")
                .setDescriptionLocalization("ru", "Просмотреть профиль игрока в Geometry Dash")
                .addStringOption(option => option
                    .setName('name')
                    .setNameLocalization("ru", 'имя')
                    .setDescription('The username of a player to view the profile')
                    .setDescriptionLocalization("ru", 'Имя игрока, чей профиль нужно просмотреть')
                    .setRequired(true)))
        .addSubcommand(sub =>
            sub
                .setName("search")
                .setNameLocalization("ru", "поиск")
                .setDescription("Search for Geometry Dash levels")
                .setDescriptionLocalization("ru", "Поиск уровней в Geometry Dash")
                .addStringOption(option => option
                    .setName('query')
                    .setNameLocalization("ru", 'запрос')
                    .setDescription('The search query (e.g. the level name or ID)')
                    .setDescriptionLocalization("ru", 'Запрос поиска (к примеру, ID или название уровня)')
                    .setMaxLength(19)
                    .setRequired(false))
                .addNumberOption(option => option
                    .setName('page')
                    .setNameLocalization("ru", 'страница')
                    .setDescription('The search page')
                    .setDescriptionLocalization("ru", 'Страница поиска')
                    .setRequired(false))),
    async execute({ client, interaction }) {
        const fs = require("fs");
        const langDb = JSON.parse(fs.readFileSync(__dirname + "/../db/lang.json").toString());
        const langFile = require(`../lang/${langDb[interaction.guild.id] ? langDb[interaction.guild.id] : "en"}.json`)

        function formatTime(time) {
            if (langDb[interaction.guild.id] == "ru") {
                let values = time.split(" ");
                let number = Number(values[0]);
                if (number == 1 || number == 21) {
                    let timePeriods = {
                        "second": "секунду",
                        "minute": "минуту",
                        "hour": "час",
                        "day": "день",
                        "week": "неделю",
                        "month": "месяц",
                        "year": "год"
                    }
                    return `${number} ${timePeriods[values[1]]}`;
                }

                if (number >= 2 && number <= 4 || number >= 22 && number <= 24) {
                    let timePeriods = {
                        "seconds": "секунды",
                        "minutes": "минуты",
                        "hours": "часа",
                        "days": "дня",
                        "weeks": "недели",
                        "months": "месяца",
                        "years": "года"
                    }
                    return `${number} ${timePeriods[values[1]]}`;
                }

                if (number >= 5 && number <= 20) {
                    let timePeriods = {
                        "seconds": "секунд",
                        "minutes": "минут",
                        "hours": "часов",
                        "days": "дней",
                        "weeks": "недель",
                        "months": "месяцев",
                        "years": "лет"
                    }
                    return `${number} ${timePeriods[values[1]]}`;
                }
            } else {
                return time;
            }
        }

        let gmdEmotes = require("../gmdemotes.json");
        function getDiffIcon(level) {
            let lowerCase = {
                "Auto": "auto",
                "Easy": "easy",
                "Normal": "normal",
                "Hard": "hard",
                "Harder": "harder",
                "Insane": "insane",
                "Easy Demon": "demon-easy",
                "Medium Demon": "demon-medium",
                "Hard Demon": "demon-hard",
                "Insane Demon": "demon-insane",
                "Extreme Demon": "demon-extreme",
                "Unrated": "unrated"
            };

            let diff = lowerCase[level.difficulty];
            if (level.featured && !level.epic) diff += "-featured";
            if (level.epic) diff += "-epic";
            return diff;
        }

        function formatLvl(lvlObject) {
            let starEmote = lvlObject.length == "Platformer" ? "<:gdmoon:1269242683608662056>" : "<:gdstar:972062974149820457>";
            let coinEmote = lvlObject.verifiedCoins ? "<:silvercoin:972356895367118878>" : "<:browncoin:972356893852958780>";
            let likeEmote = lvlObject.likes >= 0 ? "<:like:972062069862072341>" : "<:dislike:972062068683444224>";
            let coins = "-";
            if (lvlObject.coins > 1) {
                coins = "";
                for (let i = 1; i <= lvlObject.coins; i++) {
                    coins += coinEmote;
                }
            }
            let passwordInfo = "";
            if (!lvlObject.password) passwordInfo = langFile["NO"];
            if (lvlObject.password) passwordInfo = `${langFile["YES_PASS"]} ${lvlObject.password}`;
            if (lvlObject.password == "1") passwordInfo = langFile["YES"];
            let songInfo = typeof (lvlObject.song.id) == "number" ? `ID: ${lvlObject.song.id} | Size: ${lvlObject.song.fileSize}\n<:play:972364585409609760> [Play on Newgrounds](https://newgrounds.com/audio/listen/${lvlObject.song.id}) | <:dl:972364678829309952> [Download](${lvlObject.song.link})` : lvlObject.song.id;
            let string = `<:play:972364585409609760> **${lvlObject.name}** ${langFile["BY"]} **${lvlObject.creator}**\n\`\`\`${lvlObject.description}\`\`\`\n**${lvlObject.stars}** ${starEmote}\n**${langFile["GD_COINS"]}:** ${coins}\n<:download:972062600911290458> \`${lvlObject.downloads}\`\n${likeEmote} \`${lvlObject.likes}\`\n<:gdclock:1228681550724599838> \`${lvlObject.length}\`\n\n<:playsong:972084225509568532> **${lvlObject.song.name}** ${langFile["BY"]} **${lvlObject.song.artist}**\n${songInfo}\n\n**${langFile["GD_COPYABLE"]}:** ${passwordInfo}\n**${langFile["GD_LEVELVER"]}:** ${lvlObject.levelVersion}\n**${langFile["GD_GAMEVER"]}:** ${lvlObject.gameVersion}\n**${langFile["GD_OBJ"]}:** ${lvlObject.objects ? lvlObject.objects : langFile["GD_OBJ_FAIL"]}\n**${langFile["GD_UPLOADED"]}** ${formatTime(lvlObject.uploaded)} ${langFile["AGO"]}, **${langFile["GD_UPD"]}** ${formatTime(lvlObject.updated)} ${langFile["AGO"]}\n${lvlObject.copiedFrom ? `\n<:copy:986050580235559003> **${langFile["GD_ORIGINALID"]}:** ${lvlObject.copiedFrom}` : ""}${lvlObject.objects >= 40000 ? `\n<:large:972072845192593498> **${langFile["GD_MAYLAG"]}**` : ""}${lvlObject.twoPlayer ? `\n👥 **${langFile["GD_2P"]}**` : ""}`;
            return string;
        }

        function searchResults(lvls) {
            let finalString = "";
            for (let i = 0; i < lvls.length; i++) {
                let level = lvls[i];
                let number = (i + 1).toString().length == 1 ? `0${i + 1}` : i + 1;
                let starEmote = level.length == "Platformer" ? "<:gdmoon:1269242683608662056>" : "<:gdstar:972062974149820457>";
                let starCount = level.stars ? `**${level.stars}** ${starEmote} ` : "";
                let likeEmote = level.likes >= 0 ? "<:like:972062069862072341>" : "<:dislike:972062068683444224>";
                let coins = "";

                if (level.coins) {
                    let coinEmote = level.verifiedCoins ? "<:silvercoin:972356895367118878>" : "<:browncoin:972356893852958780>";
                    for (let i = 1; i <= level.coins; i++) {
                        coins += coinEmote;
                    }
                    coins += " ";
                }

                let badges = " ";
                if (level.copiedFrom) badges += "<:copy:986050580235559003> ";
                if (level.large) badges += "<:large:972072845192593498> ";

                finalString += `\`${number}\` - ${gmdEmotes[getDiffIcon(level)]} ${starCount}${coins}| **${level.name}** ${langFile["BY"]} **${level.creator}**${badges}(\`${level.id}\`)\n<:download:972062600911290458> \`${level.downloads}\` ${likeEmote} \`${level.likes}\` <:gdclock:1228681550724599838> \`${level.length}\`\n<:playsong:972084225509568532> **${level.song.name}** ${langFile["BY"]} **${level.song.artist}**\n\n`;
            }
            return finalString;
        }



        if (interaction.options.getSubcommand() == "profile") {
            let username = interaction.options.getString('name');
            let profileObject = await gd.getProfile(username);

            let stateObj = langFile["GD_STATEOBJ"]

            let modStr = langFile["GD_MOD"]

            let profileEmbed = new MessageEmbed()
                .setTitle(langFile["GD_PROFILE"].replaceAll("{{username}}", profileObject.username))
                .setColor("#807fff")
                .setDescription(`<:gdstar:972062974149820457> \`${profileObject.stars}\`\n<:gdmoon:1269242683608662056> \`${profileObject.moons}\`\n<:diamond:972062977819811900> \`${profileObject.diamonds}\`\n <:silvercoin:972356895367118878> \`${profileObject.userCoins}\`\n<:goldcoin:986536647623585863> \`${profileObject.secretCoins}\`\n<:demon_hard:1018389124870312016> \`${profileObject.demons}\`\n<:cp:986050541698306120> \`${profileObject.creatorPoints}\`\n\n<:leaderboard_rank:994121673957707806> **${langFile["GD_GLOBAL"]}** ${profileObject.rank}\n<:youtube:1132987838128988350> **YouTube:** ${profileObject.youtube ? `[Open link](https://youtube.com/channel/${profileObject.youtube})` : langFile["GD_NOT_SPECIFIED"]}\n<:twitter:1132987851584319489> **Twitter:** ${profileObject.twitter ? `[@${profileObject.twitter}](https://twitter.com/${profileObject.twitter})` : langFile["GD_NOT_SPECIFIED"]}\n<:twitch:1132987863059939419> **Twitch:** ${profileObject.twitch ? `[${profileObject.twitch}](https://twitch.tv/${profileObject.twitch})` : langFile["GD_NOT_SPECIFIED"]}\n\n<:friends:972062507487334410> **${langFile["GD_FRIEND_REQ"]}** ${stateObj[profileObject.friendRequests]}\n<:messages:972062071896285235> **${langFile["GD_MSG"]}** ${stateObj[profileObject.messages]}\n<:commenthistory:994124281384550440> **${langFile["GD_COMMENT_HISTORY"]}:** ${stateObj[profileObject.commentHistory]}\n\n${profileObject.mod != "none" ? modStr[profileObject.mod] : ""}**${langFile["GD_PLAYER_ID"]}** ${profileObject.playerID}\n**${langFile['GD_ACCOUNT_ID']}** ${profileObject.accountID}`)

            interaction.editReply({ embeds: [profileEmbed] });
        }

        if (interaction.options.getSubcommand() == "daily") {
            let level = await gd.getDailyLevel();
            let sLevel = await gd.getLevelByID(level.id);
            level.creator = sLevel.creator;
            interaction.editReply({ embeds: [new MessageEmbed().setFooter({ text: `${langFile["GD_LVL_ID"]} ${level.id}` }).setTitle(`${langFile["GD_INFO_ABOUT"]} ${level.name}`).setDescription(formatLvl(level)).setColor("#807fff").setThumbnail(`https://gdbrowser.com/assets/difficulties/${getDiffIcon(level)}.png`)] });
        }

        if (interaction.options.getSubcommand() == "weekly") {
            let level = await gd.getWeeklyDemon();
            let sLevel = await gd.getLevelByID(level.id);
            level.creator = sLevel.creator;
            interaction.editReply({ embeds: [new MessageEmbed().setFooter({ text: `${langFile["GD_LVL_ID"]} ${level.id}` }).setTitle(`${langFile["GD_INFO_ABOUT"]} ${level.name}`).setDescription(formatLvl(level)).setColor("#807fff").setThumbnail(`https://gdbrowser.com/assets/difficulties/${getDiffIcon(level)}.png`)] });
        }

        if (interaction.options.getSubcommand() == "search") {
            let levels = [];
            let interactionToSave;

            let searchQuery = interaction.options.getString("query");
            if (!searchQuery) searchQuery = "";
            let disallowedChars = /[^A-Za-z0-9 ]/;
            if (searchQuery.match(disallowedChars)) return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["GD_QUERY_INVALID_CHARS"]).setColor("#807fff")] });
            let page = interaction.options.getNumber("page");
            if (!page) page = 1;

            let dropdownOptions = [];
            try {
                levels = await gd.searchLevels(searchQuery, page);

                if (levels.length == 1) {
                    let level = await gd.dlLevel(levels[0].id);
                    level.creator = levels[0].creator;
                    return interaction.editReply({ embeds: [new MessageEmbed().setFooter({ text: `${langFile["GD_LVL_ID"]} ${level.id}` }).setTitle(`${langFile["GD_INFO_ABOUT"]} ${level.name}`).setDescription(formatLvl(level)).setColor("#807fff").setThumbnail(`https://gdbrowser.com/assets/difficulties/${getDiffIcon(level)}.png`)] });
                }

                for (let i = 0; i < levels.length; i++) {
                    let level = levels[i];

                    dropdownOptions.push({
                        label: `${level.name} ${langFile["BY"]} ${level.creator}`,
                        value: `${i.toString()}-${Buffer.from(level.creator).toString("base64")}`,
                        emoji: {
                            name: getDiffIcon(level).replaceAll("-", "_"), id: gmdEmotes[getDiffIcon(level)].split(":")[2].replaceAll(">", "")
                        }
                    })
                }

                const dropdown = new MessageActionRow()
                    .addComponents(new MessageSelectMenu()
                        .setCustomId("lvls")
                        .setPlaceholder(langFile["GD_SELECTLVL"])
                        .addOptions(dropdownOptions))
                interaction.editReply({ embeds: [new MessageEmbed().setTitle(`"${searchQuery}": ${langFile["GD_SRESULTS"]}`).setDescription(searchResults(levels)).setColor("#807fff")], components: [dropdown] });
                interactionToSave = interaction;
            } catch (e) {
                console.log(e)
                return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["GD_LVLS_NOT_FOUND"].replaceAll("{{query}}", searchQuery).replaceAll("{{page}}", page)).setColor("#807fff")] });
            }
            client.on("interactionCreate", async (interaction) => {
                if (levels) {
                    if (interaction.isSelectMenu() && interaction.customId == "lvls") {
                        for (let i = 0; i < levels.length; i++) {
                            if (interaction.values[0].startsWith(i.toString())) {
                                let level = await gd.dlLevel(levels[i].id);
                                level.creator = Buffer.from(interaction.values[0].split("-")[1], "base64").toString();
                                interactionToSave.editReply({ embeds: [new MessageEmbed().setFooter({ text: `${langFile["GD_LVL_ID"]} ${level.id}` }).setTitle(`${langFile["GD_INFO_ABOUT"]} ${level.name}`).setDescription(formatLvl(level)).setColor("#807fff").setThumbnail(`https://gdbrowser.com/assets/difficulties/${getDiffIcon(level)}.png`)], components: [] }).catch(e => {
                                    return console.log("err");
                                });
                                break;
                            } else {
                                continue;
                            }
                        }
                        return;
                    }
                }
                return;
            })
        }

        if (interaction.options.getSubcommand() == "levels-by") {
            let levels = [];
            let interactionToSave;

            let name = interaction.options.getString("name");
            if (!name) name = "";
            let page = interaction.options.getNumber("page");
            if (!page) page = 1;

            let dropdownOptions = [];
            try {
                levels = await gd.getUserLevels(name, page);

                if (levels.length == 1) {
                    let level = await gd.dlLevel(levels[0].id);
                    level.creator = levels[0].creator;
                    return interaction.editReply({ embeds: [new MessageEmbed().setFooter({ text: `${langFile["GD_LVL_ID"]} ${level.id}` }).setTitle(`${langFile["GD_INFO_ABOUT"]} ${level.name}`).setDescription(formatLvl(level)).setColor("#807fff").setThumbnail(`https://gdbrowser.com/assets/difficulties/${getDiffIcon(level)}.png`)] });
                }

                for (let i = 0; i < levels.length; i++) {
                    let level = levels[i];

                    dropdownOptions.push({
                        label: `${level.name} ${langFile["BY"]} ${level.creator}`,
                        value: `${i.toString()}-${Buffer.from(level.creator).toString("base64")}`,
                        emoji: {
                            name: getDiffIcon(level).replaceAll("-", "_"), id: gmdEmotes[getDiffIcon(level)].split(":")[2].replaceAll(">", "")
                        }
                    })
                }

                const dropdown = new MessageActionRow()
                    .addComponents(new MessageSelectMenu()
                        .setCustomId("lvls")
                        .setPlaceholder(langFile["GD_SELECTLVL"])
                        .addOptions(dropdownOptions))
                interaction.editReply({ embeds: [new MessageEmbed().setTitle(`${langFile["GD_LVLS_BY"]} \`${name}\``).setDescription(searchResults(levels)).setColor("#807fff")], components: [dropdown] });
                interactionToSave = interaction;
            } catch (e) {
                return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setDescription(langFile["GD_LVLS_NOT_FOUND_BY"].replaceAll("{{name}}", name).replaceAll("{{page}}", page)).setColor("#807fff")] });
            }
            client.on("interactionCreate", async (interaction) => {
                if (levels) {
                    if (interaction.isSelectMenu() && interaction.customId == "lvls") {
                        for (let i = 0; i < levels.length; i++) {
                            if (interaction.values[0].startsWith(i.toString())) {
                                let level = await gd.dlLevel(levels[i].id);
                                level.creator = Buffer.from(interaction.values[0].split("-")[1], "base64").toString();
                                interactionToSave.editReply({ embeds: [new MessageEmbed().setFooter({ text: `${langFile["GD_LVL_ID"]} ${level.id}` }).setTitle(`${langFile["GD_INFO_ABOUT"]} ${level.name}`).setDescription(formatLvl(level)).setColor("#807fff").setThumbnail(`https://gdbrowser.com/assets/difficulties/${getDiffIcon(level)}.png`)], components: [] }).catch(e => {
                                    return console.log("err");
                                });
                                break;
                            } else {
                                continue;
                            }
                        }
                        return;
                    }
                }
                return;
            })
        }

        if (interaction.options.getSubcommand() == "comments") {
            let levelID = interaction.options.getNumber("level");
            let page = interaction.options.getNumber("page");
            if (!page) page = 1;
            let mode = interaction.options.getString("mode");
            if (!mode) mode = 1;


            function renderComments(comments) {
                let string = "";
                comments.forEach(comment => {
                    let content = `\`\`\`${comment.content}\`\`\``;
                    let modEmote = "";
                    if (comment.mod == "mod") {
                        modEmote = " <:mod:994121928690376725> ";
                        content = `\`\`\`ansi\n\u001b[2;36m${comment.content}\u001b[0m\n\`\`\``;
                    } else if (comment.mod == "elder") {
                        modEmote = " <:mod_elder:994121924626108449> ";
                        content = `\`\`\`ansi\n\u001b[2;34m${comment.content}\u001b[0m\n\`\`\``;
                    }
                    let percent = !comment.percent ? ` ` : ` ${comment.percent}% `;
                    let likeEmote = comment.likes >= 0 ? "<:like:972062069862072341>" : "<:dislike:972062068683444224>";
                    string += `**${comment.username}**${percent}${modEmote}${likeEmote} ${comment.likes}${content}${formatTime(comment.age)} ${langFile["AGO"]}\n\n`;
                });
                return string;
            }

            try {
                let comments = await gd.getComments(levelID, page, mode);
                return interaction.editReply({ embeds: [new MessageEmbed().setColor("#807fff").setDescription(renderComments(comments)).setFooter({ text: `${langFile["GD_LVL_ID"]} ${levelID}` })] });
            } catch (e) {
                return interaction.editReply({ embeds: [new MessageEmbed().setTitle(`❌ ${langFile["ERROR"]}`).setColor("#807fff").setDescription(langFile["GD_COMMENTS_NOT_FOUND"].replaceAll("{{page}}", page))] });
            }
        }
    }
}