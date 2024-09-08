document.querySelector(".guilds-wrapper").style.opacity = 1;

function trimText(text, width) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    ctx.font = "16px SF Pro Display Regular";
    let trim = "";
    for (let i = 0; i < text.length; i++) {
        let txtWidth = ctx.measureText(text.slice(0, i)).width;
        if (txtWidth > width) {
            trim = text.slice(0, i - 1) + `…`;
            break;
        } else {
            if (i == text.length - 1) {
                trim = text;
                break;
            } else {
                continue;
            }
        }
    }
    return trim;
}

fetch("/api/guild-list").then(async (req) => {
    const json = await req.json();
    if (!json.guilds.length || (json.guilds.length != json.count)) location.reload();
    json.guilds.forEach(g => {
        let guildName = g.name;
        const totalMembersSub = `${totalMembers} ${g.members}`;
        let members = g.isMipperHere ? totalMembersSub : `<b>${invite}</b>`;
        if (!g.cached) members = cachingLine;
        const href = g.isMipperHere ? `./dashboard/${g.id}` : `https://discord.com/oauth2/authorize?client_id=929992928615608412&guild_id=${g.id}&scope=applications.commands%20bot&permissions=8`;
        const target = g.isMipperHere ? "_self" : "_blank";
        if (guildName.length > 28) guildName = `${guildName.slice(0, 28)}...`
        document.querySelector(".guilds-wrapper").innerHTML += `<a href="${href}" target="${target}" class="guild-a">
<div class="guild-card">
<div class="img-wrapper">
    <img src="${g.icon}" class="guild-img" width="48" height="48">
    <span class="guild-name">${trimText(guildName, 230)}</span>
    <hr class="card-line">
    <span class="members-count">${members}</span>
</div></div></a>`;
    })
});