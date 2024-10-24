const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'hansley',
        description: 'stopien',
        type: 1,
        options: []
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.reply({
            content: 'https://cdn.discordapp.com/attachments/1006335243210469506/1287831210692837386/ezgif-3-df5adc68a7.gif?ex=6708ba87&is=67076907&hm=2224b971e3e64ab88d8a49fd80101e793d7c25c16a9414cc5ee9035b145370a1&'
        });
    }
}).toJSON();