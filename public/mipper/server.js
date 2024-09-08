async function main() {
    if (guild.icon) document.querySelector(".icon-bg").style.backgroundImage = `url(${guild.icon})`;
    const saveButton = document.querySelector(".save button");
    const doneWrapper = document.querySelector(".done-wrapper");

    function spawnDone() {
        doneWrapper.style.bottom = "16px";
        setTimeout(() => {
            doneWrapper.style.transition = "bottom .35s ease";
        }, 150);

        setTimeout(() => {
            doneWrapper.style.bottom = "-37px";
        }, 2500);

        setTimeout(() => {
            doneWrapper.style.transition = "bottom .15s ease-out";
        }, 2900)
    }

    const beforeUnloadHandler = (e) => {
        e.preventDefault();
        e.returnValue = true;
    };

    let currentTab = "general";
    document.querySelectorAll("property-selector").forEach((element) => {
        element.addEventListener("click", () => {
            if (element.id == "backups") {
                saveButton.classList.add("offscreen");
            } else {
                saveButton.classList.remove("offscreen");
            }

            const selectedProperty = document.querySelector(".property-selected");
            selectedProperty.classList.remove("property-selected");
            element.classList.add("property-selected");

            const selectedControls = document.querySelector(`.controls-${currentTab}`);
            const newControls = document.querySelector(`.controls-${element.id}`);
            selectedControls.classList.add("controls-offscreen");
            newControls.classList.remove("controls-offscreen");
            currentTab = element.id;
        })
    })

    const newGuild = JSON.parse(JSON.stringify(guild));

    let isChanged = false;
    function setUnsaved() {
        if (!isChanged) isChanged = true;
        saveButton.disabled = false;
    }

    let roleOptionsHTML = "";
    for (const role of Object.keys(guild.roles)) {
        roleOptionsHTML += `<option value="${role}">${guild.roles[role].name}</option>`;
    }

    for (let i = 1; i <= guild.rewards.length; i++) {
        const reward = guild.rewards[i - 1];
        document.querySelector(".rewards-list").style.gap = "2px";

        let newReward = document.createElement("div");
        newReward.classList.add("reward");
        newReward.innerHTML += `<div class="reward-content"><div class="role-name-wrapper"><p>${giveLabel}</p><select class="role-dropdown" id="role-dropdown-${reward.id}"><option value="" disabled="disabled" selected="selected">${selectRole}</option>${roleOptionsHTML.replace(`<option value="${reward.role}">`, `<option value="${reward.role}" selected>`)}</select></div><div class="level-wrapper"><p>${whenReachLvl}</p><input type="number" value="${reward.level}" id="level-input-${reward.id}"></div></div><div class="reward-x" id="rx${reward.id}"><img src="../../svg/cross.svg"></div>`;
        document.querySelector(".rewards").appendChild(newReward);

        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }

        document.querySelector(`#role-dropdown-${reward.id}`).addEventListener("change", (e) => {
            newGuild.rewards.filter(r => r.id == reward.id)[0].role = e.target.value;

            if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
                setUnsaved();
                window.addEventListener("beforeunload", beforeUnloadHandler);
            } else {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                isChanged = false;
                saveButton.disabled = true;
            }
        })

        document.querySelector(`#level-input-${reward.id}`).addEventListener("input", (e) => {
            e.target.value = e.target.value.replaceAll("-", "").replaceAll(".", "");
            if (Number(e.target.value) > 9999) e.target.value = 9999;

            newGuild.rewards.filter(r => r.id == reward.id)[0].level = Number(e.target.value);

            if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
                setUnsaved();
                window.addEventListener("beforeunload", beforeUnloadHandler);
            } else {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                isChanged = false;
                saveButton.disabled = true;
            }
        })

        document.querySelector(`#rx${reward.id}`).addEventListener("click", () => {
            if (document.querySelectorAll(".reward").length == 1) document.querySelector(".rewards-list").style.gap = "0";
            document.querySelector(`#rx${reward.id}`).parentElement.remove();
            newGuild.rewards = newGuild.rewards.filter(r => r.id != reward.id);

            if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
                setUnsaved();
                window.addEventListener("beforeunload", beforeUnloadHandler);
            } else {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                isChanged = false;
                saveButton.disabled = true;
            }
        })
    }

    let h24 = langName == "English" ? false : true;
    const date = new Date();
    let timestamp;
    if (h24) {
        timestamp = `${todayAt} ${date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`}`;
    } else {
        function to12h(t24) {
            const [hours, minutes] = t24.split(':');
            let period = 'AM';

            let h12 = parseInt(hours, 10);

            if (h12 == 0) {
                h12 = 12;
            } else if (h12 == 12) {
                period = 'PM';
            } else if (h12 > 12) {
                h12 -= 12;
                period = 'PM';
            }

            return `${h12}:${minutes} ${period}`;
        }
        timestamp = `${todayAt} ${to12h(`${date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`}`)}`;
    }

    document.querySelectorAll(".preview-timestamp").forEach(e => {
        e.innerHTML = timestamp;
    })

    document.querySelector(".add-reward").addEventListener("click", () => {
        const rewardID = !newGuild.rewards.sort((a, b) => b.id - a.id)[0] ? 1 : newGuild.rewards.sort((a, b) => b.id - a.id)[0].id + 1;
        if (document.querySelector(".rewards").innerHTML) document.querySelector(".rewards-list").style.gap = "2px";
        newGuild.rewards.push({ role: "", level: null, id: rewardID });

        let newReward = document.createElement("div");
        newReward.classList.add("reward");
        newReward.innerHTML += `<div class="reward-content"><div class="role-name-wrapper"><p>${giveLabel}</p><select class="role-dropdown" id="role-dropdown-${rewardID}"><option value="" disabled="disabled" selected="selected">${selectRole}</option>${roleOptionsHTML}</select></div><div class="level-wrapper"><p>${whenReachLvl}</p><input type="number" id="level-input-${rewardID}"></div></div><div class="reward-x" id="rx${rewardID}"><img src="../../svg/cross.svg"></div>`;
        document.querySelector(".rewards").appendChild(newReward);

        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }

        document.querySelector(`#role-dropdown-${rewardID}`).addEventListener("change", (e) => {
            newGuild.rewards.filter(r => r.id == rewardID)[0].role = e.target.value;

            if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
                setUnsaved();
                window.addEventListener("beforeunload", beforeUnloadHandler);
            } else {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                isChanged = false;
                saveButton.disabled = true;
            }
        })

        document.querySelector(`#level-input-${rewardID}`).addEventListener("input", (e) => {
            e.target.value = e.target.value.replaceAll("-", "").replaceAll(".", "");
            if (Number(e.target.value) > 9999) e.target.value = 9999;

            newGuild.rewards.filter(r => r.id == rewardID)[0].level = Number(e.target.value);

            if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
                setUnsaved();
                window.addEventListener("beforeunload", beforeUnloadHandler);
            } else {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                isChanged = false;
                saveButton.disabled = true;
            }
        })

        document.querySelector(`#rx${rewardID}`).addEventListener("click", () => {
            if (document.querySelectorAll(".reward").length == 1) document.querySelector(".rewards-list").style.gap = "0";
            document.querySelector(`#rx${rewardID}`).parentElement.remove();
            newGuild.rewards = newGuild.rewards.filter(r => r.id != rewardID);

            if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
                setUnsaved();
                window.addEventListener("beforeunload", beforeUnloadHandler);
            } else {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                isChanged = false;
                saveButton.disabled = true;
            }
        })
    })

    const welcomeChannels = document.querySelector("#welcome-channels");
    let channelOptsHTML = `<option value="" disabled selected>Select a channel...</option>`;
    for (let channelID of Object.keys(guild.channels)) {
        const channel = guild.channels[channelID];
        if (!["GUILD_TEXT", "GUILD_NEWS"].includes(channel.type)) continue;
        channelOptsHTML += `<option value="${channelID}">${channel.name}</option>`
    }
    welcomeChannels.innerHTML = channelOptsHTML;

    welcomeChannels.value = guild.welcome.channel;
    welcomeChannels.addEventListener("change", () => {
        newGuild.welcome.channel = welcomeChannels.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    let gpCheck = document.querySelector("#gp");
    let langElem = document.querySelector("#lang");
    gpCheck.checked = guild.gp;
    gpCheck.onclick = () => {
        newGuild.gp = gpCheck.checked;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    }

    langElem.value = guild.lang;
    langElem.addEventListener("change", () => {
        newGuild.lang = langElem.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    let lvlCheck = document.querySelector("#lvl-turnon");
    lvlCheck.checked = guild.lvl;
    lvlCheck.onclick = () => {
        newGuild.lvl = lvlCheck.checked;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    }

    let welcomeCheck = document.querySelector("#welcome-turnon");
    welcomeCheck.checked = guild.welcome.notify;
    welcomeCheck.onclick = () => {
        newGuild.welcome.notify = welcomeCheck.checked;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    }

    let wlCheck = document.querySelector("#wl-turnon");
    wlCheck.checked = guild.welcome.lnotify;
    wlCheck.onclick = () => {
        newGuild.welcome.lnotify = wlCheck.checked;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    }

    let lvlNotify = document.querySelector("#lvl-notify");
    lvlNotify.checked = guild.lvlNotify;
    lvlNotify.onclick = () => {
        newGuild.lvlNotify = lvlNotify.checked;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    }


    const embedTitleInput = document.querySelector("#embed-title");
    const embedTitleURLInput = document.querySelector("#embed-title-url");
    const embedContentInput = document.querySelector("#embed-content");
    const embedThumbnailInput = document.querySelector("#embed-thumbnail");
    const embedImageInput = document.querySelector("#embed-image");
    const msgTextarea = document.querySelector("#lvl-custommsg");

    const msgInfo = guild.lvlMsgInfo;
    if (msgInfo.type == "embed") {
        document.querySelector(".message-embed-box").classList.remove("offscreen");
        document.querySelector(".message-input-box").classList.add("offscreen");
        document.querySelector(".preview-msg-content").classList.add("offscreen");
        document.querySelector('#msg-embed').checked = true;
    } else {
        document.querySelector(".message-embed-box").classList.add("offscreen");
        document.querySelector(".preview-embed").classList.add("offscreen");
        document.querySelector(".message-input-box").classList.remove("offscreen");
        document.querySelector('#msg-default').checked = true;
    }

    embedTitleInput.value = msgInfo.title;
    const title = msgInfo.title.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    let html = title;
    if (msgInfo.titleURL) {
        embedTitleURLInput.value = msgInfo.titleURL;
        html = `<a href="${msgInfo.titleURL}" target="_blank">${title}</a>`
    }
    document.querySelector(".preview-embed-title").innerHTML = html;

    embedContentInput.value = msgInfo.content;
    const content = msgInfo.content.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const converter = new showdown.Converter();
    html = converter.makeHtml(content);
    document.querySelector(".preview-embed-content").innerHTML = html;
    document.querySelector(".preview-msg-content").innerHTML = html;
    msgTextarea.value = msgInfo.content;

    if (msgInfo.thumbnail) {
        embedThumbnailInput.value = msgInfo.thumbnail;
        document.querySelector(".embed-thumbnail").innerHTML = `<img src="${msgInfo.thumbnail}" width="80">`;
    }
    if (msgInfo.image) {
        embedImageInput.value = msgInfo.image;
        document.querySelector(".embed-image").innerHTML = `<img src="${msgInfo.image}">`;
    }




    msgTextarea.addEventListener("input", () => {
        let value = msgTextarea.value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        const converter = new showdown.Converter();
        const html = converter.makeHtml(value);
        document.querySelector(".preview-msg-content").innerHTML = html;
        newGuild.lvlMsgInfo.content = msgTextarea.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })


    document.querySelectorAll(".msg-radio").forEach((element) => {
        element.addEventListener("click", () => {
            const value = document.querySelector('input[name="msg-type"]:checked').value;
            if (value == "embed") {
                document.querySelector(".message-embed-box").classList.remove("offscreen");
                document.querySelector(".message-input-box").classList.add("offscreen");
                document.querySelector(".preview-msg-content").classList.add("offscreen");
                document.querySelector(".preview-embed").classList.remove("offscreen");
            } else {
                document.querySelector(".message-embed-box").classList.add("offscreen");
                document.querySelector(".message-input-box").classList.remove("offscreen");

                document.querySelector(".preview-embed").classList.add("offscreen");
                document.querySelector(".preview-msg-content").classList.remove("offscreen");
            }

            newGuild.lvlMsgInfo.type = value;
            if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
                setUnsaved();
                window.addEventListener("beforeunload", beforeUnloadHandler);
            } else {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                isChanged = false;
                saveButton.disabled = true;
            }
        })
    })

    embedTitleInput.addEventListener("input", () => {
        const value = embedTitleInput.value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        let html = value;
        if (embedTitleURLInput.value) html = `<a href="${embedTitleURLInput.value}" target="_blank">${html}</a>`
        document.querySelector(".preview-embed-title").innerHTML = html;
        newGuild.lvlMsgInfo.title = value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    embedTitleURLInput.addEventListener("input", () => {
        const value = embedTitleURLInput.value;
        if (value.trim() == "") {
            document.querySelector(".preview-embed-title").innerHTML = embedTitleInput.value;
            return;
        }
        let html = value;
        if (embedTitleInput.value) html = `<a href="${value}" target="_blank">${embedTitleInput.value}</a>`
        document.querySelector(".preview-embed-title").innerHTML = html;
        newGuild.lvlMsgInfo.titleURL = value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    embedContentInput.addEventListener("input", () => {
        let value = embedContentInput.value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        const converter = new showdown.Converter();
        const html = converter.makeHtml(value);
        document.querySelector(".preview-embed-content").innerHTML = html;
        newGuild.lvlMsgInfo.content = embedContentInput.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    embedThumbnailInput.addEventListener("input", () => {
        try {
            new URL(embedThumbnailInput.value);
        } catch (e) {
            if (embedThumbnailInput.value) {
                embedThumbnailInput.classList.add("error-input");
                return;
            }
        }

        embedThumbnailInput.classList.remove("error-input");
        document.querySelector(".embed-thumbnail").innerHTML = `<img src="${embedThumbnailInput.value}" width="80">`;
        newGuild.lvlMsgInfo.thumbnail = embedThumbnailInput.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    embedImageInput.addEventListener("input", () => {
        try {
            new URL(embedImageInput.value);
        } catch (e) {
            if (embedImageInput.value) {
                embedImageInput.classList.add("error-input");
                return;
            }
        }
        embedImageInput.classList.remove("error-input");
        document.querySelector(".embed-image").innerHTML = `<img src="${embedImageInput.value}">`;

        newGuild.lvlMsgInfo.image = embedImageInput.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    const downloadBakButton = document.querySelector(".bak-dl");
    downloadBakButton.addEventListener("click", async () => {
        downloadBakButton.disabled = true;
        downloadBakButton.innerHTML = bakCreating;

        fetch("/api/dlBackup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                guild: guild.id,
                c: document.querySelector("#bak-channels").checked,
                r: document.querySelector("#bak-roles").checked,
                e: document.querySelector("#bak-emojis").checked
            })
        })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${guild.name}.mipper`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                downloadBakButton.disabled = false;
                downloadBakButton.innerHTML = bakDl;
            });
    })

    const ULB_LABEL = document.querySelector(".bak-file-label");
    const fileInput = document.querySelector("#bak-ul");
    const ULB_ERR = document.querySelector(".bak-err");

    fileInput.addEventListener("change", async () => {
        const file = fileInput.files[0];

        const reader = new FileReader();

        reader.onload = async function (event) {
            const binaryData = event.target.result;
            const base64Data = btoa(binaryData);

            ULB_LABEL.innerHTML = uploading;
            ULB_LABEL.classList.add("bak-disabled");
            fileInput.disabled = true;
            ULB_ERR.innerHTML = "";

            const req = await fetch('/api/ulBackup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "bf": base64Data,
                    "guild": guild.id
                })
            })

            const response = await req.text();
            if (response == "-1") {
                ULB_ERR.innerHTML = bakErr;
                ULB_LABEL.innerHTML = bakSelect;
                ULB_LABEL.classList.remove("bak-disabled");
                fileInput.disabled = false;
            } else {
                ULB_LABEL.innerHTML = bakSelect;
                ULB_LABEL.classList.remove("bak-disabled");
                fileInput.disabled = false;
                spawnDone();
            }
        };
        reader.readAsBinaryString(file);
    })



    const wembedTitleInput = document.querySelector("#wembed-title");
    const wembedTitleURLInput = document.querySelector("#wembed-title-url");
    const wembedContentInput = document.querySelector("#wembed-content");
    const wembedThumbnailInput = document.querySelector("#wembed-thumbnail");
    const wembedImageInput = document.querySelector("#wembed-image");
    const wmsgTextarea = document.querySelector("#welcome-custommsg");

    const wmsgInfo = guild.welcome.msg;
    if (wmsgInfo.type == "embed") {
        document.querySelector(".welcome-customizer .message-embed-box").classList.remove("offscreen");
        document.querySelector(".welcome-customizer .message-input-box").classList.add("offscreen");
        document.querySelector(".preview-msg-content.wmsg").classList.add("offscreen");
        document.querySelector('#wmsg-embed').checked = true;
    } else {
        document.querySelector(".welcome-customizer .message-embed-box").classList.add("offscreen");
        document.querySelector(".preview-embed.wembed").classList.add("offscreen");
        document.querySelector(".welcome-customizer .message-input-box").classList.remove("offscreen");
        document.querySelector('#wmsg-default').checked = true;
    }

    wembedTitleInput.value = wmsgInfo.title;
    const wtitle = wmsgInfo.title.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    document.querySelector(".wembed .preview-embed-title").innerHTML = wtitle;
    if (wmsgInfo.titleURL) {
        wembedTitleURLInput.value = wmsgInfo.titleURL;
        document.querySelector(".wembed .preview-embed-title").innerHTML = `<a href="${wmsgInfo.titleURL}" target="_blank">${wtitle}</a>`
    }

    wembedContentInput.value = wmsgInfo.content;
    const wcontent = wmsgInfo.content.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    document.querySelector(".wembed .preview-embed-content").innerHTML = converter.makeHtml(wcontent);
    document.querySelector(".preview-msg-content.wmsg").innerHTML = converter.makeHtml(wcontent);
    wmsgTextarea.value = wmsgInfo.content;

    if (wmsgInfo.thumbnail) {
        wembedThumbnailInput.value = wmsgInfo.thumbnail;
        document.querySelector(".wembed .embed-thumbnail").innerHTML = `<img src="${wmsgInfo.thumbnail}" width="80">`;
    }

    if (wmsgInfo.image) {
        wembedImageInput.value = wmsgInfo.image;
        document.querySelector(".wembed .embed-image").innerHTML = `<img src="${wmsgInfo.image}">`;
    }




    wmsgTextarea.addEventListener("input", () => {
        let value = wmsgTextarea.value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        const converter = new showdown.Converter();
        const html = converter.makeHtml(value);
        document.querySelector(".preview-msg-content.wmsg").innerHTML = html;
        newGuild.welcome.msg.content = wmsgTextarea.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })


    document.querySelectorAll(".wmsg-radio").forEach((element) => {
        element.addEventListener("click", () => {
            const value = document.querySelector('input[name="wmsg-type"]:checked').value;
            if (value == "embed") {
                document.querySelector(".welcome-customizer .message-embed-box").classList.remove("offscreen");
                document.querySelector(".welcome-customizer .message-input-box").classList.add("offscreen");
                document.querySelector(".preview-msg-content.wmsg").classList.add("offscreen");
                document.querySelector(".preview-embed.wembed").classList.remove("offscreen");
            } else {
                document.querySelector(".welcome-customizer .message-embed-box").classList.add("offscreen");
                document.querySelector(".welcome-customizer .message-input-box").classList.remove("offscreen");

                document.querySelector(".preview-embed.wembed").classList.add("offscreen");
                document.querySelector(".preview-msg-content.wmsg").classList.remove("offscreen");
            }

            newGuild.welcome.msg.type = value;
            if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
                setUnsaved();
                window.addEventListener("beforeunload", beforeUnloadHandler);
            } else {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                isChanged = false;
                saveButton.disabled = true;
            }
        })
    })

    wembedTitleInput.addEventListener("input", () => {
        const value = wembedTitleInput.value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        let html = value;
        if (wembedTitleURLInput.value) html = `<a href="${wembedTitleURLInput.value}" target="_blank">${html}</a>`
        document.querySelector(".wembed .preview-embed-title").innerHTML = html;
        newGuild.welcome.msg.title = value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    wembedTitleURLInput.addEventListener("input", () => {
        const value = wembedTitleURLInput.value;
        if (value.trim() == "") {
            document.querySelector(".wembed .preview-embed-title").innerHTML = wembedTitleInput.value;
            return;
        }
        let html = value;
        if (wembedTitleInput.value) html = `<a href="${value}" target="_blank">${wembedTitleInput.value}</a>`
        document.querySelector(".wembed .preview-embed-title").innerHTML = html;
        newGuild.welcome.msg.titleURL = value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    wembedContentInput.addEventListener("input", () => {
        let value = wembedContentInput.value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        const converter = new showdown.Converter();
        const html = converter.makeHtml(value);
        document.querySelector(".wembed .preview-embed-content").innerHTML = html;
        newGuild.welcome.msg.content = wembedContentInput.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    wembedThumbnailInput.addEventListener("input", () => {
        try {
            new URL(wembedThumbnailInput.value);
        } catch (e) {
            if (wembedThumbnailInput.value) {
                wembedThumbnailInput.classList.add("error-input");
                return;
            }
        }

        wembedThumbnailInput.classList.remove("error-input");
        document.querySelector(".wembed .embed-thumbnail").innerHTML = `<img src="${wembedThumbnailInput.value}" width="80">`;
        newGuild.welcome.msg.thumbnail = wembedThumbnailInput.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    wembedImageInput.addEventListener("input", () => {
        try {
            new URL(wembedImageInput.value);
        } catch (e) {
            if (wembedImageInput.value) {
                wembedImageInput.classList.add("error-input");
                return;
            }
        }
        wembedImageInput.classList.remove("error-input");
        document.querySelector(".wembed .embed-image").innerHTML = `<img src="${wembedImageInput.value}">`;

        newGuild.welcome.msg.image = wembedImageInput.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })



    const wlembedTitleInput = document.querySelector("#wlembed-title");
    const wlembedTitleURLInput = document.querySelector("#wlembed-title-url");
    const wlembedContentInput = document.querySelector("#wlembed-content");
    const wlembedThumbnailInput = document.querySelector("#wlembed-thumbnail");
    const wlembedImageInput = document.querySelector("#wlembed-image");
    const wlmsgTextarea = document.querySelector("#wl-custommsg");

    const wlmsgInfo = guild.welcome.lmsg;
    if (wlmsgInfo.type == "embed") {
        document.querySelector(".wl-customizer .message-embed-box").classList.remove("offscreen");
        document.querySelector(".wl-customizer .message-input-box").classList.add("offscreen");
        document.querySelector(".preview-msg-content.wlmsg").classList.add("offscreen");
        document.querySelector('#wlmsg-embed').checked = true;
    } else {
        document.querySelector(".wl-customizer .message-embed-box").classList.add("offscreen");
        document.querySelector(".preview-embed.wlembed").classList.add("offscreen");
        document.querySelector(".wl-customizer .message-input-box").classList.remove("offscreen");
        document.querySelector('#wlmsg-default').checked = true;
    }

    wlembedTitleInput.value = wlmsgInfo.title;
    const wltitle = wlmsgInfo.title.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    document.querySelector(".wlembed .preview-embed-title").innerHTML = wltitle;
    if (wlmsgInfo.titleURL) {
        wlembedTitleURLInput.value = wlmsgInfo.titleURL;
        document.querySelector(".wlembed .preview-embed-title").innerHTML = `<a href="${wlmsgInfo.titleURL}" target="_blank">${wltitle}</a>`
    }

    wlembedContentInput.value = wlmsgInfo.content;
    const wlcontent = wlmsgInfo.content.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    document.querySelector(".wlembed .preview-embed-content").innerHTML = converter.makeHtml(wlcontent);
    document.querySelector(".preview-msg-content.wlmsg").innerHTML = converter.makeHtml(wlcontent);
    wlmsgTextarea.value = wlmsgInfo.content;

    if (wlmsgInfo.thumbnail) {
        wlembedThumbnailInput.value = wlmsgInfo.thumbnail;
        document.querySelector(".wlembed .embed-thumbnail").innerHTML = `<img src="${wlmsgInfo.thumbnail}" width="80">`;
    }

    if (wlmsgInfo.image) {
        wlembedImageInput.value = wlmsgInfo.image;
        document.querySelector(".wlembed .embed-image").innerHTML = `<img src="${wlmsgInfo.image}">`;
    }




    wlmsgTextarea.addEventListener("input", () => {
        let value = wlmsgTextarea.value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        const converter = new showdown.Converter();
        const html = converter.makeHtml(value);
        document.querySelector(".preview-msg-content.wlmsg").innerHTML = html;
        newGuild.welcome.lmsg.content = wlmsgTextarea.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })


    document.querySelectorAll(".wlmsg-radio").forEach((element) => {
        element.addEventListener("click", () => {
            const value = document.querySelector('input[name="wlmsg-type"]:checked').value;
            if (value == "embed") {
                document.querySelector(".wl-customizer .message-embed-box").classList.remove("offscreen");
                document.querySelector(".wl-customizer .message-input-box").classList.add("offscreen");
                document.querySelector(".preview-msg-content.wlmsg").classList.add("offscreen");
                document.querySelector(".preview-embed.wlembed").classList.remove("offscreen");
            } else {
                document.querySelector(".wl-customizer .message-embed-box").classList.add("offscreen");
                document.querySelector(".wl-customizer .message-input-box").classList.remove("offscreen");

                document.querySelector(".preview-embed.wlembed").classList.add("offscreen");
                document.querySelector(".preview-msg-content.wlmsg").classList.remove("offscreen");
            }

            newGuild.welcome.lmsg.type = value;
            if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
                setUnsaved();
                window.addEventListener("beforeunload", beforeUnloadHandler);
            } else {
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                isChanged = false;
                saveButton.disabled = true;
            }
        })
    })

    wlembedTitleInput.addEventListener("input", () => {
        const value = wlembedTitleInput.value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        let html = value;
        if (wlembedTitleURLInput.value) html = `<a href="${wlembedTitleURLInput.value}" target="_blank">${html}</a>`
        document.querySelector(".wlembed .preview-embed-title").innerHTML = html;
        newGuild.welcome.lmsg.title = value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    wlembedTitleURLInput.addEventListener("input", () => {
        const value = wlembedTitleURLInput.value;
        if (value.trim() == "") {
            document.querySelector(".wlembed .preview-embed-title").innerHTML = wlembedTitleInput.value;
            return;
        }
        let html = value;
        if (wlembedTitleInput.value) html = `<a href="${value}" target="_blank">${wlembedTitleInput.value}</a>`
        document.querySelector(".wlembed .preview-embed-title").innerHTML = html;
        newGuild.welcome.lmsg.titleURL = value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    wlembedContentInput.addEventListener("input", () => {
        let value = wlembedContentInput.value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        const converter = new showdown.Converter();
        const html = converter.makeHtml(value);
        document.querySelector(".wlembed .preview-embed-content").innerHTML = html;
        newGuild.welcome.lmsg.content = wlembedContentInput.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    wlembedThumbnailInput.addEventListener("input", () => {
        try {
            new URL(wlembedThumbnailInput.value);
        } catch (e) {
            if (wlembedThumbnailInput.value) {
                wlembedThumbnailInput.classList.add("error-input");
                return;
            }
        }

        wlembedThumbnailInput.classList.remove("error-input");
        document.querySelector(".wlembed .embed-thumbnail").innerHTML = `<img src="${wlembedThumbnailInput.value}" width="80">`;
        newGuild.welcome.lmsg.thumbnail = wlembedThumbnailInput.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })

    wlembedImageInput.addEventListener("input", () => {
        try {
            new URL(wlembedImageInput.value);
        } catch (e) {
            if (wlembedImageInput.value) {
                wlembedImageInput.classList.add("error-input");
                return;
            }
        }
        wlembedImageInput.classList.remove("error-input");
        document.querySelector(".wlembed .embed-image").innerHTML = `<img src="${wlembedImageInput.value}">`;

        newGuild.welcome.lmsg.image = wlembedImageInput.value;
        if (JSON.stringify(newGuild) != JSON.stringify(guild)) {
            setUnsaved();
            window.addEventListener("beforeunload", beforeUnloadHandler);
        } else {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
            isChanged = false;
            saveButton.disabled = true;
        }
    })


    saveButton.addEventListener("click", async () => {
        saveButton.innerHTML = saving;
        saveButton.disabled = true;
        await fetch("/api/update", {
            method: "POST",
            body: JSON.stringify({
                guild: guild.id,
                lang: langElem.value,
                gp: gpCheck.checked,
                lvl: lvlCheck.checked,
                lvlNotify: lvlNotify.checked,
                lvlMsgInfo: JSON.stringify(newGuild.lvlMsgInfo),
                rewards: JSON.stringify(newGuild.rewards),
                welcome: JSON.stringify(newGuild.welcome)
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async (a) => {
            const response = await a.text();
            if (response == "1") {
                guild.lang = langElem.value;
                guild.gp = gpCheck.checked;
                guild.lvl = lvlCheck.checked;
                guild.lvlNotify = lvlNotify.checked;
                guild.lvlMsgInfo = JSON.parse(JSON.stringify(newGuild.lvlMsgInfo));
                guild.rewards = JSON.parse(JSON.stringify(newGuild.rewards));
                guild.welcome = JSON.parse(JSON.stringify(newGuild.welcome));
                window.removeEventListener("beforeunload", beforeUnloadHandler);
                saveButton.innerHTML = saveText;

                spawnDone();
            }
        })
    })
}

main();