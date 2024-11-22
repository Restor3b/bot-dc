const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const fs = require('fs');

module.exports = new ApplicationCommand({
    command: {
        name: 'szkolenie_zarzadzanie',
        description: 'Nadaj lub zabierz szkolenie',
        type: 1,
        options: [
            {
                name: 'osoba_szkolona',
                description: 'Funkcjonariusz, któremu nadajesz lub zabierasz szkolenie',
                type: 6,
                required: true
            },
            {
                name: 'akcja',
                description: 'Wybierz, czy chcesz nadać, czy zabrać szkolenie',
                type: 3,
                required: true,
                choices: [
                    { name: 'Nadaj', value: 'nadaj' },
                    { name: 'Zabierz', value: 'zabierz' }
                ]
            },
            {
                name: 'ranga',
                description: 'Ranga, którą chcesz nadać lub zabrać',
                type: 8,
                required: true
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
        await interaction.deferReply({ ephemeral: true });

        const osobaSzkolona = interaction.options.getMember('osoba_szkolona');
        const akcja = interaction.options.getString('akcja');
        const ranga = interaction.options.getRole('ranga');
        const userId = interaction.user.id;
        const timestamp = new Date().toISOString();

        try {
            if (akcja === 'nadaj') {
                await osobaSzkolona.roles.add(ranga);
                await interaction.editReply({ content: `Ranga ${ranga.name} została nadana ${osobaSzkolona}.` });
            } else if (akcja === 'zabierz') {
                await osobaSzkolona.roles.remove(ranga);
                await interaction.editReply({ content: `Ranga ${ranga.name} została zabrana ${osobaSzkolona}.` });
            }

            const logMessage = `${timestamp} - Użytkownik <@${userId}> użył komendy szkolenie_zarzadzanie na osobie <@${osobaSzkolona.id}> z akcją: ${akcja}, ranga: ${ranga.name}\n`;
            fs.appendFile('szkolenie_logs.txt', logMessage, (err) => {
                if (err) {
                    console.error('Błąd podczas zapisywania logu:', err);
                }
            });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'Wystąpił błąd podczas wykonywania akcji.' });
        }
    }
}).toJSON();
