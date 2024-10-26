const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'gify',
        description: 'wybierz z listy gifów',
        type: 1,
        options: [
            {
                name: 'gif',
                description: 'Wybierz gif',
                type: 3,
                required: true,
                choices: [
                    { name: 'Gif 1', value: '1' },
                    { name: 'Gif 2', value: '2' },
                    { name: 'Gif 3', value: '3' },
                    { name: 'Gif 4', value: '4' },
                    { name: 'Gif 5', value: '5' },
                    { name: 'Gif 6', value: '6' },
                    { name: 'Gif 7', value: '7' },
                    { name: 'Gif 8', value: '8' }
                ]
            }
        ]
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
        const selectedGif = interaction.options.getString('gif');
        const gifUrls = {
            '1': 'https://cdn.discordapp.com/attachments/1006335243210469506/1287831210692837386/ezgif-3-df5adc68a7.gif?ex=671e7b47&is=671d29c7&hm=d378fcfe526710d681143cace259bc59840ea54efa90a8072710f1733086f825&',
            '2': 'https://cdn.discordapp.com/attachments/1228619475016880219/1297681407283433482/image0.gif?ex=671e0fbd&is=671cbe3d&hm=34e96a232fa9d13c60db4daca939c524ee89bac46a9adf89fa80513f29614cd9&',
            '3': 'https://cdn.discordapp.com/attachments/1238211887137689650/1278901316814508113/image.gif?ex=671e4b6a&is=671cf9ea&hm=c91f1ce3c28f3f7f60fde8ad193d6a016756f6d276d2b448142e0d22102e3edb&',
            '4': 'https://cdn.discordapp.com/attachments/999072304464154797/1282705246665052260/ezgif-3-10f0d0de45.gif?ex=671e4a5a&is=671cf8da&hm=74fb744ce8ca2f395651c92d7d5ddfaa706e92c47e138a301d62b9275376af8b&',
            '5': 'https://cdn.discordapp.com/attachments/1274713747382075404/1293523865502486560/ezgif.com-animated-gif-maker_2.gif?ex=671e18fa&is=671cc77a&hm=91f2ef02f377acc24372b7b8a207f9e9974ce39e099ac38c5e7862fb271193d6&',
            '6': 'https://cdn.discordapp.com/attachments/1276250899647565938/1284122881630142514/ezgif.com-animated-gif-maker.gif?ex=671e2ca0&is=671cdb20&hm=877f525bdc95359c8f263f62af2072bc347e4fb6240a111aedc1c61e49db0fee&',
            '7': 'https://cdn.discordapp.com/attachments/1259796858813808770/1280957934012203068/ezgif-6-a542e68c1d.gif?ex=671e868a&is=671d350a&hm=50a0e3c9c59147ab143579f313b9e18335f496dbeddb09a00edb2be9ea3b5d70&',
            '8': 'https://media.discordapp.net/attachments/999072304464154797/1197159988997656597/zjeby_pierdolone.gif?ex=671e361f&is=671ce49f&hm=f1a7c4a448f97b8843d49f70ab3246e751188e63281f740298e718c03ab3a559&'
        };

        await interaction.reply({
            content: gifUrls[selectedGif]
        });
    }
}).toJSON();