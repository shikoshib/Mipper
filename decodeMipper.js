// This code is a decoder for the .mipper file format used for server backups

const zlib = require("zlib");
module.exports = {
    decodeMipper: function (gzip) {
        const mipperObject = { channels: [], roles: [], emojis: [], name: "", verificationLevel: "" };
        const file = zlib.gunzipSync(gzip).toString();

        if (!file.startsWith("bak;")) throw new Error("It is not a valid backup file!");

        const chunks = file.split(";");

        const channels = chunks[2].split("|");
        channels.pop();
        const roles = chunks[3].split("|");
        roles.pop();
        const emojis = chunks[4].split(":");
        emojis.pop();

        for (const channelChunk of channels) {
            let channel = { name: Buffer.from(channelChunk.split("~")[0], "base64").toString(), type: `GUILD_${channelChunk.split("~")[1]}` };
            const id = channelChunk.split("~")[2];
            if (channel.type == "GUILD_CATEGORY") {
                channel.id = id;
            } else {
                channel.parent = id;
            }

            mipperObject.channels.push(channel);
        }

        for (const roleChunk of roles) {
            mipperObject.roles.push({
                name: Buffer.from(roleChunk.split("~")[0], "base64").toString(),
                color: "#" + roleChunk.split("~")[1],
                permissions: JSON.parse(roleChunk.split("~")[2]),
                position: Number(roleChunk.split("~")[3])
            });
        }

        for (const emojiChunk of emojis) {
            mipperObject.emojis.push({
                name: emojiChunk.split("|")[0],
                data: emojiChunk.split("|")[1],
                animated: !emojiChunk.split("|")[1].startsWith("iV")
            });
        }

        mipperObject.name = Buffer.from(chunks[5], "base64").toString();
        mipperObject.verificationLevel = chunks[6];

        return mipperObject;
    }
}