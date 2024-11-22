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
                    { name: 'Inny rodzaj szkolenia', value: 'Inny rodzaj szkolenia' }
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
                { name: 'Rodzaj szkolenia: ', value: `${rodzajSzkolenia}`},
                { name: 'Wynik egzaminu: ', value: `${wynikOpis}`},
                { name: 'Data: ', value: `${dataSzkolenia}`},
                { name: 'Podpis: ', value: `${podpis}`},
                { name: '**------------------------------------------------------------------**', value: ' '}
            )
            .setColor(0x2f3136)
            .setThumbnail('https://media.discordapp.net/attachments/1293717333461827747/1299497166158565457/f85cc66dd65a679d957ca4d6c668d070.png?ex=67371fcb&is=6735ce4b&hm=61111b91dbed6885f3246c0df49727602aed4e3ace52730dfe9f988e4167fbd8&=&format=webp&quality=lossless');

        const channelId = '1259796858654429292';
        let channel = client.channels.cache.get(channelId);
        if (!channel) {
            await interaction.editReply({ content: 'Nie znaleziono kanału do wysłania wiadomości.' });
            return;
        }

        try {
            await channel.send(`<@${osobaSzkolona.id}>`);
            await channel.send({ embeds: [embed] });
            await interaction.editReply({ content: 'Informacja o szkoleniu została wysłana.' });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'Wystąpił błąd podczas wysyłania wiadomości.' });
        }
    }
}).toJSON();
