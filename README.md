# Mipper

Mipper was a multipurpose Discord bot with multiple functions:

* Moderation commands
* Utility commands
* Geometry Dash level and profile browsing
* AI chatbot
* Online dashboard

Just to name a few.

Believe it or not, but Mipper was the first project that actually made me start programming in early 2022. I kept refining and polishing it, ensuring that it's a well-made bot.

But nothing lasts forever. On September 15th, 2024, Mipper was officially shut down. The reason is because I couldn't afford paying for YandexGPT's API and the VPS much longer. Moreover, I lost motivation to keep maintaining it, combined with me entering high school.

So in order to honor Mipper's legacy, I'm publicly uploading the source code. It may be messy, unstable and buggy, **but it's mine**.

Rest in Peace, Mipper. 2022/01/10 - 2024/09/15

# Setting up
Before the actual set up, I want to mention a few things that Mipper had, but are left out in this repository.
* AI chatbot (`/ai`)
  
  It uses the YandexGPT model, which is a genuine pain to set up, and gives worse output that GPT-3.5.
* Windows fake error generator (`/winerr`)
  
  It's basically [winerr](https://github.com/shikoshib/winerr) rewritten in Node.js.
## Creating the bot account
1. Go to the [Discord Developer Portal](https://discord.com/developers) and create a new bot by clicking "New Application".
2. Copy **Application ID** and put it into `config.json` (`clientId` property).
3. Go to "OAuth2" and reset the "Client Secret", then put it into `config.json` (`clientSecret` property).
4. Hit "Add Redirect" and insert `http://localhost:3000/auth/discord/redirect`.
5. Go to "Bot" and reset the **Token**, then put it into `config.json` (`token` property).
6. Finally, go back to "OAuth2" to the URL Generator. Choose `applications.commands` and `bot`, then select the **Administrator** permissions.
7. Copy the generated link below and invite the bot to your server by opening it.
## Starting the bot
1. Download [Node.js](https://nodejs.org/en/download) if you haven't already.
2. Download this repository and extract it in any directory.
3. Open the said directory in the command prompt or PowerShell.
4. Run `npm i` to install all of the packages.
5. After they're installed, run `npm start`.
6. Once the console says `Mipper is running`, the bot should work and the website should be running at http://localhost:3000/
# Credits
`shikoshib` — programming, Russian translation

`.dmytroyastrubiv` — Ukrainian translation

`datukich`, `kotvpanke` — AI suggestion

`diocs` — /password command suggestion
