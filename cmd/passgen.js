const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("passgen")
        .setNameLocalization("ru", "пароль")
        .setDescription("Generate a random password")
        .setDescriptionLocalization("ru", "Сгенерировать случайный пароль")
        .addNumberOption(opt => opt
            .setName("length")
            .setNameLocalization("ru", "длина")
            .setDescription("The password's length")
            .setDescriptionLocalization("ru", "Количество символов в пароле")
            .setMinValue(1)
            .setMaxValue(50)
            .setRequired(false))
        .addBooleanOption(opt => opt
            .setName("special-characters")
            .setNameLocalization("ru", "специальные-символы")
            .setDescription("Whether or not to use the special characters (-!?*)")
            .setDescriptionLocalization("ru", "Использовать ли специальные символы в пароле (-!?*)")
            .setRequired(false)),
    async execute({ client, interaction }) {
        const length = interaction.options.getNumber("length") || 15;
        const specialCharacters = interaction.options.getBoolean("special-characters");

        if (specialCharacters == null) specialCharacters = true;

        const array = specialCharacters ?
            ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
                "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
                "u", "v", "w", "x", "y", "z", "A", "B", "C", "D",
                "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
                "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
                "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7",
                "8", "9", "!", "-", "?", "*"] :
            ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
                "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
                "u", "v", "w", "x", "y", "z", "A", "B", "C", "D",
                "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
                "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X",
                "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7",
                "8", "9"];

        function getRandom(n) {
            return Math.floor(Math.random() * n);
        }

        function pass() {
            let pass = "";

            for (let i = 0; i < length; i++) {
                let index = getRandom(array.length);
                if (!array[index]) {
                    i--;
                    continue;
                }
                pass += array[index];
            }

            return pass;
        }

        return interaction.editReply({ content: pass() })
    }
}