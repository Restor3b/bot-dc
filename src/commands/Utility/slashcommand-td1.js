const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'szkolenie',
        description: 'Wysłaj informacje o szkoleniu',
        type: 1,
        options: [
            {
                name: 'osoba_szkolona',
                description: 'Funkcjonariusz, który przeszedł szkolenie',
                type: 6,
                required: true
            },
            {
                name: 'szkoleniowiec',
                description: 'Funkcjonariusz prowadzący szkolenie',
                type: 6,
                required: true
            },
            {
                name: 'rodzaj_szkolenia',
                description: 'Rodzaj szkolenia',
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
                    { name: 'Inny rodzaj szkolenia', value: 'Inny rodzaj szkolenia' } // <-- Dodaj inne rodzaje szkolenia wedle potrzeby
                ]
            },
            {
                name: 'data_szkolenia',
                description: 'Data szkolenia (DD.MM.RRRR)',
                type: 3,
                required: true
            },
            {
                name: 'wynik_egzaminu',
                description: 'Wynik egzaminu (zdany/niezdany)',
                type: 3,
                required: true,
                choices: [
                    { name: 'Zdany', value: 'zdany' },
                    { name: 'Niezdany', value: 'niezdany' }
                ]
            },
            {
                name: 'liczba_punktow',
                description: 'Liczba punktów (wymagane dla egzaminu Deputy)',
                type: 4,
                required: false
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

        const osobaSzkolona = interaction.options.getUser('osoba_szkolona');
        const szkoleniowiec = interaction.options.getUser('szkoleniowiec');
        const rodzajSzkolenia = interaction.options.getString('rodzaj_szkolenia');
        const dataSzkolenia = interaction.options.getString('data_szkolenia');
        const wynikEgzaminu = interaction.options.getString('wynik_egzaminu');
        const liczbaPunktow = interaction.options.getInteger('liczba_punktow');

        let wynikOpis = wynikEgzaminu;
        if (rodzajSzkolenia === 'Deputy egzamin' && wynikEgzaminu === 'zdany') {
            if (liczbaPunktow === null) {
                await interaction.editReply({ content: 'Musisz podać liczbę punktów dla egzaminu Deputy.' });
                return;
            }
            wynikOpis = `zdany ${liczbaPunktow}/229`;
        }

        const podpis = interaction.member.nickname || szkoleniowiec.username;

        const embed = new EmbedBuilder()
            .setAuthor({ name: szkoleniowiec.username, iconURL: szkoleniowiec.displayAvatarURL() })
            .setTitle(`Informacja o szkoleniu`)
            .addFields(
                { name: '**------------------------------------------------------------------**', value: ' '},
                { name: 'Osoba szkolona:', value: `<@${osobaSzkolona.id}>`},
                { name: 'Szkoleniowiec: ', value: `<@${szkoleniowiec.id}>`},
                { name: 'Rodzaj szkolenia: ', value: `${rodzajSzkolenia}`, inline: true },
                { name: 'Wynik egzaminu: ', value: `${wynikOpis}`, inline: true },
                { name: 'Data: ', value: `${dataSzkolenia}`, },
                { name: 'Podpis: ', value: `${podpis}`, inline: true },
                { name: '**------------------------------------------------------------------**', value: ' '}
            )
            .setColor(0x2f3136);

        const channelId = '1299672680391245846';
        let channel = client.channels.cache.get(channelId);
        if (!channel) {
            await interaction.editReply({ content: 'Nie znaleziono kanału do wysłania wiadomości.' });
            return;
        }

        try {
            await channel.send({ embeds: [embed] });
            await interaction.editReply({ content: 'Informacja o szkoleniu została wysłana.' });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'Wystąpił błąd podczas wysyłania wiadomości.' });
        }
    }
}).toJSON();
