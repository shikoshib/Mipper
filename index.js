const fs = require("fs");
const zlib = require("zlib");

const { cron } = require("./cron");
cron();

const toBoolean = {
    "false": false,
    "true": true,
    false: false,
    true: true
}

const config = require("./config.json");

const token = config.token;
const clientId = config.clientId;

const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');

const DiscordJS = require("discord.js");
const client = new DiscordJS.Client({
    partials: ["CHANNEL",
        "MESSAGE",
        "REACTION"],
    intents: ["GUILDS",
        "GUILD_MESSAGES",
        "GUILD_VOICE_STATES",
        "GUILD_MEMBERS",
        DiscordJS.Intents.FLAGS.DIRECT_MESSAGES,
        DiscordJS.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    restRequestTimeout: 60000,
    allowedMentions: {
        parse: ["users"],
        repliedUser: true
    },
    ws: {
        properties: {
            browser: "Discord iOS"
        }
    }
});

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const passport = require("passport");
const { Strategy } = require("passport-discord");

app.use(express.json({ limit: "4mb" }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());

app.get("/api/auth/", passport.authenticate("discord"), (req, res) => {
    res.status(200).send("api auth")
})

app.use(require("express-session")({
    secret: 'TUlQUEVSbWlwcGVy',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: false,
    },
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new Strategy({
    clientID: clientId,
    clientSecret: config.clientSecret,
    callbackURL: "http://localhost:3000/auth/discord/redirect",
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.get("/mipper", (req, res) => {
    let html = fs.readFileSync(__dirname + "/html-mipper/main.html").toString();
    html = html
        .replace("((commands-ran))", fs.readFileSync(__dirname + "/db/commands-ran.txt").toString())
        .replace("((servers))", client.guilds.cache.size)
        .replace("\"((userinfo))\"", JSON.stringify(req.user ? {
            id: req.user.id,
            username: req.user.username,
            discriminator: req.user.discriminator,
            avatar: req.user.avatar ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png?size=256` : "/svg/discord.svg"
        } : null));

    const ml = req.cookies.ml || "en";
    const langFile = fs.existsSync(__dirname + `/html-mipper/lang/${ml}.json`) ? JSON.parse(fs.readFileSync(__dirname + `/html-mipper/lang/${ml}.json`).toString()) : JSON.parse(fs.readFileSync(__dirname + `/html-mipper/lang/en.json`).toString());

    for (const key of Object.keys(langFile)) {
        html = html.replaceAll(`((${key}))`, langFile[key]);
    }
    return res.send(html);
})


app.get("/mipper/dashboard", async (req, res) => {
    let user = req.user;
    if (user) {
        let html = fs.readFileSync(__dirname + "/html-mipper/dashboard.html").toString();

        const ml = req.cookies.ml || "en";
        const langFile = fs.existsSync(__dirname + `/html-mipper/lang/${ml}.json`) ? JSON.parse(fs.readFileSync(__dirname + `/html-mipper/lang/${ml}.json`).toString()) : JSON.parse(fs.readFileSync(__dirname + `/html-mipper/lang/en.json`).toString());

        for (const key of Object.keys(langFile)) {
            html = html.replaceAll(`((${key}))`, langFile[key]);
        }
        html = html
            .replace("\"((userinfo))\"", JSON.stringify(req.user ? {
                id: req.user.id,
                username: req.user.username,
                discriminator: req.user.discriminator,
                avatar: req.user.avatar ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png?size=256` : "https://shikoshib.ru/svg/discord.svg"
            } : null));
        return res.send(html);
    }
    return res.redirect("/auth/discord");
})

app.get("/api/guild-list", async (req, res) => {
    let user = req.user;
    if (user) {
        let arr = [];
        let count = 0;
        user.guilds.forEach(async (g) => {
            const prms = new DiscordJS.Permissions(g.permissions_new)
            if (prms.has("ADMINISTRATOR")) count++;
        })

        let cachingQueue = [];

        user.guilds.forEach(async (g) => {
            const prms = new DiscordJS.Permissions(g.permissions_new)
            const guildObj = client.guilds.cache.get(g.id);
            let isMipperHere = false;
            if (guildObj) isMipperHere = true;

            let memberCount = 0;

            const guildCached = fs.existsSync(__dirname + `/cache/guilds/${g.id}.json`);
            if (!guildCached && isMipperHere) {
                cachingQueue.push(g.id);
            } else if (guildCached && isMipperHere) {
                const guildCache = JSON.parse(fs.readFileSync(__dirname + `/cache/guilds/${g.id}.json`).toString());
                memberCount = guildCache.length;
            }

            let icon = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`;
            if (!g.icon) icon = "/svg/discord.svg"
            if (prms.has("ADMINISTRATOR")) arr.push({ id: g.id, name: g.name, icon: icon, isMipperHere: isMipperHere, members: memberCount, cached: guildCached });
        })

        res.json({ count: count, guilds: arr });

        for (let g of cachingQueue) {
            const guildObj = client.guilds.cache.get(g);
            if (!guildObj) return;
            let guildMembers = [];
            await guildObj.members.fetch().then(m => {
                for (let member of JSON.parse(JSON.stringify(m))) {
                    guildMembers.push({ id: member.userId, avatar: member.avatar, name: member.displayName });
                }
                fs.writeFileSync(__dirname + `/cache/guilds/${g}.json`, JSON.stringify(guildMembers));
            })

            memberCount = guildObj.members.cache.size;
        }
        return;
    }
    return res.status(401).send("-1");
})

app.get("/mipper/terms", (req, res) => {
    let html = fs.readFileSync(__dirname + "/html-mipper/tos.html").toString();
    html = html
        .replace("\"((userinfo))\"", JSON.stringify(req.user ? {
            id: req.user.id,
            username: req.user.username,
            discriminator: req.user.discriminator,
            avatar: req.user.avatar ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png?size=256` : "https://shikoshib.ru/svg/discord.svg"
        } : null));

    const ml = req.cookies.ml || "en";
    const langFile = fs.existsSync(__dirname + `/html-mipper/lang/${ml}.json`) ? JSON.parse(fs.readFileSync(__dirname + `/html-mipper/lang/${ml}.json`).toString()) : JSON.parse(fs.readFileSync(__dirname + `/html-mipper/lang/en.json`).toString());

    for (const key of Object.keys(langFile)) {
        html = html.replaceAll(`((${key}))`, langFile[key]);
    }
    return res.send(html);
})

app.get("/mipper/privacy", (req, res) => {
    let html = fs.readFileSync(__dirname + "/html-mipper/privacy.html").toString();
    html = html
        .replace("\"((userinfo))\"", JSON.stringify(req.user ? {
            id: req.user.id,
            username: req.user.username,
            discriminator: req.user.discriminator,
            avatar: req.user.avatar ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png?size=256` : "https://shikoshib.ru/svg/discord.svg"
        } : null));

    const ml = req.cookies.ml || "en";
    const langFile = fs.existsSync(__dirname + `/html-mipper/lang/${ml}.json`) ? JSON.parse(fs.readFileSync(__dirname + `/html-mipper/lang/${ml}.json`).toString()) : JSON.parse(fs.readFileSync(__dirname + `/html-mipper/lang/en.json`).toString());

    for (const key of Object.keys(langFile)) {
        html = html.replaceAll(`((${key}))`, langFile[key]);
    }
    return res.send(html);
})

app.get("/mipper/dashboard/:id", (req, res) => {
    if (!req.user) return res.redirect("/auth/discord");
    if (Number(req.params.id) == NaN) return res.status(403).send("-1");
    const server = client.guilds.cache.get(req.params.id);
    if (!server) return res.status(403).send("-1");

    const gpEnabled = JSON.parse(fs.readFileSync(__dirname + "/db/ghost-ping.json").toString())[server.id] == true ? true : false;
    let lang = JSON.parse(fs.readFileSync(__dirname + "/db/lang.json").toString())[server.id];
    if (!lang) lang = "en";

    const lvlEnabled = JSON.parse(fs.readFileSync(__dirname + "/db/lvl-enabled.json").toString()).includes(server.id) ? true : false;
    const levelFileExists = fs.existsSync(__dirname + `/db/levels/${server.id}.json`);
    const levelFile = !levelFileExists ? {
        "info": {
            notify: false,
            rewards: [],
            msg: {
                "thumbnail": "",
                "content": "",
                "title": "",
                "type": "default",
                "titleURL": "",
                "image": ""
            }
        }
    } : JSON.parse(fs.readFileSync(__dirname + `/db/levels/${server.id}.json`).toString());
    if (!levelFile.info) levelFile.info = {
        notify: false,
        rewards: [],
        msg: {
            "thumbnail": "",
            "content": "",
            "title": "",
            "type": "default",
            "titleURL": "",
            "image": ""
        }
    };

    const lvlNotifyEnabled = levelFile.info.notify;
    const lvlMsgInfo = levelFile.info.msg;
    const rewards = levelFile.info.rewards;

    const welcomeFileExists = fs.existsSync(__dirname + `/db/welcome/${server.id}.json`);
    const welcomeFile = !welcomeFileExists ? {
        "notify": false,
        "channel": "",
        "msg": {
            "thumbnail": "",
            "content": "",
            "title": "",
            "type": "default",
            "titleURL": "",
            "image": ""
        },
        "lmsg": {
            "thumbnail": "",
            "content": "",
            "title": "",
            "type": "default",
            "titleURL": "",
            "image": ""
        }
    } : JSON.parse(fs.readFileSync(__dirname + `/db/welcome/${server.id}.json`).toString());

    let channels = {};
    server.channels.cache.forEach((c) => {
        if (c.type == "GUILD_CATEGORY") return;
        channels[c.id] = { name: c.name, type: c.type };
    })

    let roles = {};
    server.roles.cache.forEach((r) => {
        if (!r.tags) return;
        if (Object.keys(r.tags).length != 0) return;
        if (r.name == "@everyone") return;
        roles[r.id] = { name: r.name };
    })

    const guildObject = {
        channels: channels,
        name: server.name,
        id: server.id,
        icon: server.iconURL({
            format: "png",
            dynamic: true,
            size: 256
        }),
        gp: gpEnabled,
        lang: lang,
        lvl: lvlEnabled,
        lvlMsgInfo: lvlMsgInfo,
        lvlNotify: lvlNotifyEnabled,
        roles: roles,
        rewards: rewards,
        welcome: welcomeFile
    };

    const ml = req.cookies.ml || "en";
    const langFile = fs.existsSync(__dirname + `/html-mipper/lang/${ml}.json`) ? JSON.parse(fs.readFileSync(__dirname + `/html-mipper/lang/${ml}.json`).toString()) : JSON.parse(fs.readFileSync(__dirname + `/html-mipper/lang/en.json`).toString());

    let html = fs.readFileSync(__dirname + "/html-mipper/server-page.html").toString();
    for (const key of Object.keys(langFile)) {
        html = html.replaceAll(`((${key}))`, langFile[key]);
    }
    html = html
        .replaceAll(`{ channels: {}, name: "", id: null, icon: "", gp: null, lang: "", lvl: null, lvlMsgInfo: {}, lvlNotify: null, roles: {}, rewards: [], welcome: {} }`, JSON.stringify(guildObject))
        .replaceAll("((title))", `${guildObject.name} | ${langFile["dashboard-title"]}`).replaceAll("((favicon))", guildObject.icon ? guildObject.icon : "../mpr.ico")
        .replace("\"((userinfo))\"", JSON.stringify(req.user ? {
            id: req.user.id,
            username: req.user.username,
            discriminator: req.user.discriminator,
            avatar: req.user.avatar ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png?size=256` : "https://shikoshib.ru/svg/discord.svg"
        } : null));
    return res.send(html);
})

app.post("/api/dlBackup/", async (req, res) => {
    if (!req.user) return res.status(401).send("-1");
    const guild = client.guilds.cache.get(req.body.guild);
    const includeChannels = toBoolean[req.body.c];
    const includeRoles = toBoolean[req.body.r];
    const includeEmojis = toBoolean[req.body.e];
    if (!guild) return res.status(403).send("-1");

    res.setHeader("Content-Type", "application/octet-stream");

    let date = new Date();
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()))
    let obj = `bak;${date.getTime()};`;

    let channels = "";
    let roles = "";
    let emojis = "";

    if (includeChannels) {
        guild.channels.cache.forEach(c => {
            if (c.type == "GUILD_CATEGORY") return channels += `${Buffer.from(c.name).toString("base64")}~${c.type.split("GUILD_")[1]}~${c.id}|`;
            channels += `${Buffer.from(c.name).toString("base64")}~${c.type.split("GUILD_")[1]}~${c.parentId}|`;
        })
    }

    if (includeRoles) {
        guild.roles.cache.forEach(r => {
            if (Object.keys(r.tags).length != 0 || r.tags == null) return;
            if (r.name == "@everyone") return;
            roles += `${Buffer.from(r.name).toString("base64")}~${r.hexColor.split("#")[1]}~${JSON.stringify(r.permissions.toArray())}~${r.position}|`;
        })
    }

    if (includeEmojis) {
        async function fetchEmojis() {
            let emojis = "";
            let promises = [];

            guild.emojis.cache.forEach((emoji, index) => {
                let promise = new Promise(async (resolve) => {
                    const req = await fetch(emoji.url);
                    const ab = await req.arrayBuffer();
                    emojis += `${emoji.name}|${Buffer.from(ab).toString("base64")}:`;
                    resolve();
                });
                promises.push(promise);
            });

            await Promise.all(promises);
            return emojis;
        }

        emojis = await fetchEmojis();
    }

    obj += `${channels};${roles};${emojis};${Buffer.from(guild.name).toString("base64")};${guild.verificationLevel}`;

    const gzip = zlib.gzipSync(obj);
    res.send(gzip);
})


app.post("/api/ulBackup", async (req, res) => {
    if (!req.user) return res.status(401).send("-1");
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive')
    const backupFile = req.body.bf;
    const id = req.body.guild;
    const guild = client.guilds.cache.get(id);

    function sortArray(array, property) {
        let sorted = array.sort((a, b) => {
            if (a[property] < b[property]) {
                return -1;
            }
            if (a[property] > b[property]) {
                return 1;
            }
            return 0;
        });
        return sorted;
    }

    const { decodeMipper } = require("./decodeMipper");
    let mipperFile;
    try {
        mipperFile = decodeMipper(Buffer.from(backupFile, "base64"));
    } catch (e) {
        return res.status(400).send("-1");
    }

    let channels = sortArray(mipperFile.channels, "type");
    let categoriesObj = {};
    for (let channel of channels) {
        let fail = false;
        if (channel.type == "GUILD_CATEGORY") {
            await new Promise((resolve, reject) => {
                guild.channels.create(channel.name, {
                    type: channel.type
                }).then(c => {
                    categoriesObj[channel.id] = c.id;
                    resolve();
                }).catch(e => {
                    fail = true;
                    reject();
                });
            });
        } else {
            let parent = guild.channels.cache.get(categoriesObj[channel.parent]);
            guild.channels.create(channel.name, {
                type: channel.type,
                parent: parent
            }).catch(e => {
                fail = true;
            });
        }
        if (fail) continue;
    };

    let roles = sortArray(mipperFile.roles, "position");
    for (let role of roles) {
        let fail = false;
        guild.roles.create({
            name: role.name,
            color: role.color,
            permissions: role.permissions,
            position: role.position
        }).catch(e => {
            fail = true;
        });
        if (fail) continue;
    }

    guild.setName(mipperFile.name).catch(e => {
        // womp womp
    });

    guild.setVerificationLevel(mipperFile.verificationLevel).catch(e => {
        // womp womp
    });

    const emojisBoost = {
        "NONE": 50,
        "TIER_1": 100,
        "TIER_2": 150,
        "TIER_3": 250
    }

    let animatedEmojis = emojisBoost[guild.premiumTier] - guild.emojis.cache.filter(e => e.animated).size;
    let staticEmojis = emojisBoost[guild.premiumTier] - guild.emojis.cache.filter(e => !e.animated).size;

    let ranOutOfAnimatedEmojis = false;
    let ranOutOfStaticEmojis = false;

    for (let emoji of mipperFile.emojis) {
        if (ranOutOfAnimatedEmojis && ranOutOfStaticEmojis) {
            break;
        };

        const emojiAnimated = emoji.data.startsWith("R");
        if (emojiAnimated && ranOutOfAnimatedEmojis) continue;
        if (!emojiAnimated && ranOutOfStaticEmojis) continue;
        guild.emojis.create(Buffer.from(emoji.data, "base64"), emoji.name).catch(e => {
            if (e.message.includes("Maximum number of emojis reached")) {
                if (emojiAnimated) {
                    ranOutOfAnimatedEmojis = true;
                } else {
                    ranOutOfStaticEmojis = true;
                }
            }
        });

        if (emojiAnimated) {
            animatedEmojis--;
        } else {
            staticEmojis--;
        }
    }

    return res.send("1");
})

app.get('/mipper/logout', function (req, res) {
    if (!req.user) return res.redirect('/mipper');
    req.logout(function (err) {
        if (err) { return res.status(403).send(err); }
        res.redirect('/mipper');
    });
});

app.post("/api/update", (req, res) => {
    const guildId = req.body.guild;
    const lang = req.body.lang;
    const gp = req.body.gp;
    const lvlEnabled = req.body.lvl;
    const lvlNotifyEnabled = req.body.lvlNotify;
    const lvlMsgInfo = req.body.lvlMsgInfo;
    const rewards = req.body.rewards;
    const welcome = req.body.welcome;

    const gpFile = JSON.parse(fs.readFileSync(__dirname + "/db/ghost-ping.json").toString());
    const langFile = JSON.parse(fs.readFileSync(__dirname + "/db/lang.json").toString());
    const lvlEnabledFile = JSON.parse(fs.readFileSync(__dirname + "/db/lvl-enabled.json").toString());
    const levelFileExists = fs.existsSync(__dirname + `/db/levels/${guildId}.json`);
    const lvlNotifyEnabledFile = !levelFileExists ? {
        "info": {
            notify: false,
            rewards: [],
            msg: {
                "thumbnail": "",
                "content": "",
                "title": "",
                "type": "",
                "titleURL": "",
                "image": ""
            }
        }
    } : JSON.parse(fs.readFileSync(__dirname + `/db/levels/${guildId}.json`).toString());
    const welcomeFileExists = fs.existsSync(__dirname + `/db/welcome/${guildId}.json`);
    let welcomeFile = !welcomeFileExists ? {
        "notify": false,
        "channel": "",
        "msg": {
            "thumbnail": "",
            "content": "",
            "title": "",
            "type": "default",
            "titleURL": "",
            "image": ""
        },
        "lmsg": {
            "thumbnail": "",
            "content": "",
            "title": "",
            "type": "default",
            "titleURL": "",
            "image": ""
        }
    } : JSON.parse(fs.readFileSync(__dirname + `/db/welcome/${guildId}.json`).toString());

    gpFile[guildId] = gp;
    langFile[guildId] = lang;
    if (lvlEnabled == "false") {
        lvlEnabledFile = lvlEnabledFile.filter(a => a == guildId);
    } else {
        if (!lvlEnabledFile.includes(guildId)) lvlEnabledFile.push(guildId);
    }

    const boolean = {
        "true": true,
        "false": false
    };

    if (!lvlNotifyEnabledFile.info) lvlNotifyEnabledFile.info = {
        notify: false,
        rewards: [],
        msg: {
            "thumbnail": "",
            "content": "",
            "title": "",
            "type": "default",
            "titleURL": "",
            "image": ""
        }
    };

    lvlNotifyEnabledFile.info.notify = boolean[lvlNotifyEnabled];
    lvlNotifyEnabledFile.info.msg = JSON.parse(lvlMsgInfo);
    lvlNotifyEnabledFile.info.rewards = JSON.parse(rewards);

    welcomeFile = JSON.parse(welcome);

    fs.writeFileSync(__dirname + "/db/ghost-ping.json", JSON.stringify(gpFile));
    fs.writeFileSync(__dirname + "/db/lang.json", JSON.stringify(langFile));
    fs.writeFileSync(__dirname + "/db/lvl-enabled.json", JSON.stringify(lvlEnabledFile));
    fs.writeFileSync(__dirname + `/db/levels/${guildId}.json`, JSON.stringify(lvlNotifyEnabledFile));
    fs.writeFileSync(__dirname + `/db/welcome/${guildId}.json`, JSON.stringify(welcomeFile));

    res.send("1");
})

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/redirect', passport.authenticate('discord', {
    failureRedirect: '/login',
    session: true
}), (req, res) => {
    res.redirect('/mipper/dashboard');
});

app.use((req, res) => {
    return res.status(404).sendFile(__dirname + "/html-mipper/404.html");
})

app.listen(3000);

client.commands = new DiscordJS.Collection();
let commands = [];
const slashCmdFiles = fs.readdirSync(__dirname + "/cmd").filter(f => f.endsWith(".js"));

for (const file of slashCmdFiles) {
    const command = require(`./cmd/${file}`);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The ${file} command is missing a required "data" or "execute" property.`);
    }
}

const rest = new REST().setToken(token);

client.commands.forEach((command) => {
    commands.push(command.data.toJSON());
});

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();

client.on("ready", async () => {
    console.log(`Mipper is running`);

    function removeWarn(list, id) {
        return list.filter(w => w.id != id);
    }

    const now = new Date();
    for (let warnFileName of fs.readdirSync(__dirname + "/db/warns")) {
        if (!warnFileName.endsWith(".json")) return;
        let warnFile = JSON.parse(fs.readFileSync(__dirname + `/db/warns/${warnFileName}`).toString());
        for (let warn of warnFile) {
            if (warn.timestamp == "Infinity") continue;
            if (warn.timestamp < now.getTime()) {
                warnFile = removeWarn(warnFile, warn.id);
            } else {
                setTimeout(() => {
                    warnFile = removeWarn(warnFile, warn.id);
                    fs.writeFileSync(__dirname + `/db/warns/${warnFileName}`, JSON.stringify(warnFile));
                }, warn.timestamp - now.getTime());
            }
        }

        fs.writeFileSync(__dirname + `/db/warns/${warnFileName}`, JSON.stringify(warnFile));
    }
});

client.on("interactionCreate", (interaction) => {
    async function handleCmd() {
        if (!interaction.guild) return;
        if (!interaction.isCommand()) return;

        const slashcmd = client.commands.get(interaction.commandName);
        if (!slashcmd) interaction.reply("Not a valid cmd");

        const guildCached = fs.existsSync(__dirname + `/cache/guilds/${interaction.guild.id}.json`);

        try {
            if (!guildCached) {
                let guildMembers = [];
                await interaction.guild.members.fetch().then(m => {
                    for (let member of JSON.parse(JSON.stringify(m))) {
                        guildMembers.push({ id: member.userId, avatar: member.avatar, name: member.displayName });
                    }
                    fs.writeFileSync(__dirname + `/cache/guilds/${interaction.guild.id}.json`, JSON.stringify(guildMembers));
                })
            }

            await interaction.deferReply();
            await slashcmd.execute({ client, interaction });
        } catch (e) {
            return;
        }
    }

    handleCmd();
    if (!interaction.options) return;

    try {
        let commandsRan = Number(fs.readFileSync(__dirname + "/db/commands-ran.txt").toString());
        commandsRan++;
        fs.writeFileSync(__dirname + "/db/commands-ran.txt", commandsRan.toString());
    } catch {
        return;
    }
})



client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const { LevelInfo } = require("./LevelInfo");
    const levels = new LevelInfo();
    const levelEnabledArray = JSON.parse(fs.readFileSync(__dirname + "/db/lvl-enabled.json").toString());

    if (levelEnabledArray.includes(message.guild.id)) {
        let levelingInfo;
        if (!fs.existsSync(__dirname + `/db/levels/${message.guild.id}.json`)) {
            levelingInfo = {};
        } else {
            levelingInfo = JSON.parse(fs.readFileSync(__dirname + `/db/levels/${message.guild.id}.json`).toString());
        }

        let userLvlInfo = levelingInfo[message.author.id];
        if (!userLvlInfo) userLvlInfo = { xp: 0, cooldown: 0, name: "" };

        const userXP = userLvlInfo.xp;
        const cooldownReset = userLvlInfo.cooldown;

        if (Date.now() < cooldownReset) return;

        const userLvl = levels.getLevelFromXP(userXP);
        const newLvl = levels.getLevelFromXP(userXP + 2);

        userLvlInfo.xp = userXP + 2;
        userLvlInfo.cooldown = Date.now() + 30 * 1000;
        levelingInfo[message.author.id] = userLvlInfo;

        userLvlInfo.name = message.member.displayName;

        fs.writeFileSync(__dirname + `/db/levels/${message.guild.id}.json`, JSON.stringify(levelingInfo));

        if (newLvl > userLvl && levelingInfo.info.notify) {
            const newRewards = levelingInfo.info.rewards.filter(r => r.level == newLvl);
            for (const reward of newRewards) {
                message.member.roles.add(reward.role);
            }

            const messageInfo = levelingInfo.info.msg;
            if (messageInfo.type == "default") {
                if (messageInfo.content.trim() == "") return;
                message.reply(messageInfo.content.replaceAll("{{member}}", `<@${message.author.id}>`).replaceAll("{{level}}", newLvl));
            } else {
                const embed = new DiscordJS.MessageEmbed().setColor("#807fff").setURL(messageInfo.titleURL).setThumbnail(messageInfo.thumbnail).setImage(messageInfo.image);
                if (messageInfo.title) embed.title = messageInfo.title.replaceAll("{{member}}", `<@${message.author.id}>`).replaceAll("{{level}}", newLvl);
                if (messageInfo.content) embed.description = messageInfo.content.replaceAll("{{member}}", `<@${message.author.id}>`).replaceAll("{{level}}", newLvl);
                message.reply({ embeds: [embed] });
            }
        }
    }
});

client.on("messageDelete", (message) => {
    if (!message.guild) return;
    const gp = JSON.parse(fs.readFileSync(__dirname + "/db/ghost-ping.json").toString());

    if (gp[message.guild.id] == true) {
        const mentions = Array.from(message.mentions.users.values());
        if (!mentions.length || message.author.bot) return;
        if (mentions.length) {
            message.channel.send({ embeds: [new DiscordJS.MessageEmbed().setTitle("👻 Ghost ping!").setDescription(`Message author: <@${message.author.id}>\nMessage content: ${message.content}`).setColor("#807fff")] })
        }
    }
});

client.on("guildMemberAdd", async (member) => {
    const guildCached = fs.existsSync(__dirname + `/cache/guilds/${member.guild.id}.json`);
    if (!guildCached) {
        let guildMembers = [];
        await member.guild.members.fetch().then(m => {
            for (let member of JSON.parse(JSON.stringify(m))) {
                guildMembers.push({ id: member.userId, avatar: member.avatar, name: member.displayName });
            }
            fs.writeFileSync(__dirname + `/cache/guilds/${member.guild.id}.json`, JSON.stringify(guildMembers));
        })
    } else {
        let guildMembers = JSON.parse(fs.readFileSync(__dirname + `/cache/guilds/${member.guild.id}.json`).toString());
        guildMembers.push({ id: member.id, avatar: member.avatar, name: member.displayName });
    }

    let welcomeTurnedOn = false;
    if (fs.existsSync(__dirname + `/db/welcome/${member.guild.id}.json`)) {
        welcomeTurnedOn = JSON.parse(fs.readFileSync(__dirname + `/db/welcome/${member.guild.id}.json`).toString()).notify;
    }

    if (welcomeTurnedOn) {
        if (member.user.bot) return;
        const welcomeFile = JSON.parse(fs.readFileSync(__dirname + `/db/welcome/${member.guild.id}.json`).toString());
        const channel = client.channels.cache.get(welcomeFile.channel);
        if (!channel) return;

        const messageInfo = welcomeFile.msg;
        if (messageInfo.type == "default") {
            if (messageInfo.content.trim() == "") return;
            channel.send(messageInfo.content.replaceAll("{{member}}", `<@${member.id}>`).replaceAll("{{name}}", member.guild.name));
        } else {
            const embed = new DiscordJS.MessageEmbed().setColor("#807fff").setURL(messageInfo.titleURL).setThumbnail(messageInfo.thumbnail).setImage(messageInfo.image);
            if (messageInfo.title) embed.title = messageInfo.title.replaceAll("{{member}}", `<@${member.id}>`).replaceAll("{{name}}", member.guild.name);
            if (messageInfo.content) embed.description = messageInfo.content.replaceAll("{{member}}", `<@${member.id}>`).replaceAll("{{name}}", member.guild.name);
            channel.send({ embeds: [embed] });
        }
    }
});



client.on("guildMemberRemove", async (member) => {
    const guildCached = fs.existsSync(__dirname + `/cache/guilds/${member.guild.id}.json`);
    if (!guildCached) {
        let guildMembers = [];
        await member.guild.members.fetch().then(m => {
            for (let member of JSON.parse(JSON.stringify(m))) {
                guildMembers.push({ id: member.userId, avatar: member.avatar, name: member.displayName });
            }
            fs.writeFileSync(__dirname + `/cache/guilds/${member.guild.id}.json`, JSON.stringify(guildMembers));
        })
    } else {
        let guildMembers = JSON.parse(fs.readFileSync(__dirname + `/cache/guilds/${member.guild.id}.json`).toString());
        fs.writeFileSync(__dirname + `/cache/guilds/${member.guild.id}.json`, JSON.stringify(guildMembers.filter(m => m.id != member.id)));
    }

    let welcomeTurnedOn = false;
    if (fs.existsSync(__dirname + `/db/welcome/${member.guild.id}.json`)) {
        welcomeTurnedOn = JSON.parse(fs.readFileSync(__dirname + `/db/welcome/${member.guild.id}.json`).toString()).lnotify;
    }

    if (welcomeTurnedOn) {
        if (member.user.bot) return;
        const welcomeFile = JSON.parse(fs.readFileSync(__dirname + `/db/welcome/${member.guild.id}.json`).toString());
        const channel = client.channels.cache.get(welcomeFile.channel);
        if (!channel) return;

        const messageInfo = welcomeFile.lmsg;
        if (messageInfo.type == "default") {
            if (messageInfo.content.trim() == "") return;
            channel.send(messageInfo.content.replaceAll("{{member}}", `<@${member.id}>`).replaceAll("{{name}}", member.guild.name));
        } else {
            const embed = new DiscordJS.MessageEmbed().setColor("#807fff").setURL(messageInfo.titleURL).setThumbnail(messageInfo.thumbnail).setImage(messageInfo.image);
            if (messageInfo.title) embed.title = messageInfo.title.replaceAll("{{member}}", `<@${member.id}>`).replaceAll("{{name}}", member.guild.name);
            if (messageInfo.content) embed.description = messageInfo.content.replaceAll("{{member}}", `<@${member.id}>`).replaceAll("{{name}}", member.guild.name);
            channel.send({ embeds: [embed] });
        }
    }
});



client.on("guildMemberUpdate", async (oldM, newM) => {
    const guildCached = fs.existsSync(__dirname + `/cache/guilds/${newM.guild.id}.json`);
    if (!guildCached) {
        let guildMembers = [];
        await newM.guild.members.fetch().then(m => {
            for (let member of JSON.parse(JSON.stringify(m))) {
                guildMembers.push({ id: member.userId, avatar: member.avatar, name: member.displayName });
            }
            fs.writeFileSync(__dirname + `/cache/guilds/${newM.guild.id}.json`, JSON.stringify(guildMembers));
        })
    }

    if (oldM.displayName != newM.displayName && guildCached) {
        let guildMembers = JSON.parse(fs.readFileSync(__dirname + `/cache/guilds/${newM.guild.id}.json`).toString());
        let newGM = guildMembers.filter(m => m.id != newM.id);
        newGM.push({ id: newM.id, avatar: newM.displayAvatarURL, name: newM.displayName })
        fs.writeFileSync(__dirname + `/cache/guilds/${newM.guild.id}.json`, JSON.stringify(newGM));
    }
})

client.login(token);