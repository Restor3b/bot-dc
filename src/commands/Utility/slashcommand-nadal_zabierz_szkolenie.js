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
                    { name: 'ASD', value: 'ASD' },
                    { name: 'SV', value: 'SV' },
                    { name: 'KPP', value: 'KPP' },
                    { name: 'PWC', value: 'PWC' },
                    { name: 'MVE', value: 'MVE' },
                    { name: 'SEU', value: 'SEU' },
                    { name: 'WSU', value: 'WSU' },
                    { name: 'NEG', value: 'NEG' }
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
            'ASD': '1396593664364384457',
            'SV':  '1396593665274548336',
            'KPP': '1396593667631874098',
            'PWC': '1396593673856094309',
            'MVE': '1396593674988814358',
            'SEU': '1396593676461015203',
            'WSU': '1396593677266059457',
            'NEG': '1396593678742454352'
        };

        const rangaId = szkolenieRoles[rodzajSzkolenia];
        const ranga = interaction.guild.roles.cache.get(rangaId);
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

            const logMessage = `${timestamp} - Użytkownik <@${userId}> użył komendy szkolenie_zarzadzanie na osobie <@${osobaSzkolona.id}> z akcją: ${akcja}, ranga: ${rodzajSzkolenia}
`;
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
