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
                name: 'rodzaj_szkolenia',
                description: 'Wybierz rodzaj szkolenia, które chcesz nadać lub zabrać',
                type: 3,
                required: true,
                choices: [
                    { name: 'Deputy egzamin', value: 'Deputy egzamin' },
                    { name: 'ASD', value: 'ASD' },
                    { name: 'SV', value: 'SV' },
                    { name: 'RTO', value: 'RTO' },
                    { name: 'KPP', value: 'KPP' },
                    { name: 'PWC', value: 'PWC' },
                    { name: 'MVE', value: 'MVE' },
                    { name: 'SEU', value: 'SEU' },
                    { name: 'WSU', value: 'WSU' },
                    { name: 'NEG', value: 'NEG' },
                    { name: 'Inny rodzaj szkolenia', value: 'Inny rodzaj szkolenia' }
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
        await interaction.deferReply({ ephemeral: true });

        const osobaSzkolona = interaction.options.getMember('osoba_szkolona');
        const akcja = interaction.options.getString('akcja');
        const rodzajSzkolenia = interaction.options.getString('rodzaj_szkolenia');
        const userId = interaction.user.id;
        const timestamp = new Date().toISOString();

        const szkolenieRoles = {
            'Deputy egzamin': 'Deputy egzamin',
            'ASD': 'ASD',
            'SV': 'SV',
            'RTO': 'RTO',
            'KPP': 'KPP',
            'PWC': 'PWC',
            'MVE': 'MVE',
            'SEU': 'SEU',
            'WSU': 'WSU',
            'NEG': 'NEG'
        };

        const ranga = szkolenieRoles[rodzajSzkolenia];
        if (!ranga) {
            await interaction.editReply({ content: 'Nie znaleziono rangi o podanym ID.' });
            return;
        }

        try {
            if (akcja === 'nadaj') {
                await osobaSzkolona.roles.add(ranga);
                await interaction.editReply({ content: `Ranga ${rodzajSzkolenia} została nadana ${osobaSzkolona}.` });
            } else if (akcja === 'zabierz') {
                await osobaSzkolona.roles.remove(ranga);
                await interaction.editReply({ content: `Ranga ${rodzajSzkolenia} została zabrana ${osobaSzkolona}.` });
            }

            // Log the action to a file
            const logMessage = `${timestamp} - Użytkownik <@${userId}> użył komendy szkolenie_zarzadzanie na osobie <@${osobaSzkolona.id}> z akcją: ${akcja}, ranga: ${rodzajSzkolenia}\n`;
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
