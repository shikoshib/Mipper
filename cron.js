// This script is ran every time Mipper starts up

const fs = require("fs");
module.exports = {
    cron: function () {
        try {
            // Remove any audio leftovers
            for (let file of fs.readdirSync(__dirname + "/audio")) {
                if (filename.endsWith(".md")) continue;
                fs.unlinkSync(__dirname + `/audio/${file}`);
            }

            // Remove any screenshot leftovers
            for (let file of fs.readdirSync(__dirname + "/screenshots")) {
                if (filename.endsWith(".md")) continue;
                fs.unlinkSync(__dirname + `/screenshots/${file}`);
            }

            // Purge guild cache leftovers
            for (let file of fs.readdirSync(__dirname + "/cache/guilds")) {
                if (filename.endsWith(".md")) continue;
                fs.unlinkSync(__dirname + `/cache/guilds/${file}`);
            }

            // Remove rewards with no role or no level
            for (let filename of fs.readdirSync(__dirname + "/db/levels")) {
                if (filename.endsWith(".md")) continue;
                let file = JSON.parse(fs.readFileSync(__dirname + `/db/levels/${filename}`).toString());
                file.info.rewards = file.info.rewards.filter(r => r.role != "" || r.level != null);
                fs.writeFileSync(__dirname + `/db/levels/${filename}`, JSON.stringify(file));
            }
        } catch (e) {
            console.log(e);
        }
    }
}