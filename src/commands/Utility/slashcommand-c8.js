const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const { google } = require('googleapis');

module.exports = new ApplicationCommand({
    command: {
        name: 'c8',
        description: 'Wysyła dane do Google Sheets.',
        type: 1,
        options: [
            {
                name: 'pwc',
                description: 'Wpisz wartość PWC',
                type: 3,
                required: true
            },
            {
                name: 'apwc',
                description: 'Wpisz wartość APWC',
                type: 3,
                required: true
            },
            {
                name: 'iloscfp',
                description: 'Wpisz ilość FP',
                type: 4,
                required: true
            },
            {
                name: 'kod',
                description: 'Wybierz kod',
                type: 3,
                required: true,
                choices: [
                    { name: 'zielony', value: 'zielony' },
                    { name: 'pomaranczowy', value: 'pomaranczowy' },
                    { name: 'czerwony', value: 'czerwony' },
                    { name: 'czarny', value: 'czarny' }
                ]
            },
            {
                name: 'uwagi',
                description: 'Uwagi',
                type: 3,
                required: false
            },
            {
                name: 'obraz',
                description: 'Załącz obraz',
                type: 11, // typ Attachment
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
        // ID roli wymaganej do użycia komendy (jeśli potrzebne)
        const requiredRoleId = '1299662554473435186'; 
        const member = interaction.guild.members.cache.get(interaction.user.id);

        // Sprawdź uprawnienia (jeśli chcesz)
        if (!member.roles.cache.has(requiredRoleId)) {
            await interaction.reply({
                content: 'Nie masz uprawnień do użycia tej komendy.',
                ephemeral: true
            });
            return;
        }

        // Odpowiadamy, żeby Discord nie uznał nas za "timeout"
        await interaction.deferReply({ ephemeral: true });

        // Pobieramy wartości z slash-komendy
        const pwc = interaction.options.getString('pwc');
        const apwc = interaction.options.getString('apwc');
        const iloscFP = interaction.options.getInteger('iloscfp');
        const kod = interaction.options.getString('kod'); // Będzie jedną z wybranych opcji
        const uwagi = interaction.options.getString('uwagi') || 'Brak';
        const obraz = interaction.options.getAttachment('obraz'); // Opcja z załączonym plikiem

        // Budujemy embed dla potwierdzenia
        const embed = new EmbedBuilder()
            .setTitle('Nowy wpis do Google Sheets')
            .setColor(0x2f3136)
            .addFields(
                { name: 'PWC', value: pwc, inline: true },
                { name: 'APWC', value: apwc, inline: true },
                { name: 'Ilość FP', value: iloscFP.toString(), inline: true },
                { name: 'Kod', value: kod, inline: true },
                { name: 'Uwagi', value: uwagi }
            );
        
        // Dodajemy obraz do embeda (opcjonalnie, można pominąć)
        if (obraz && obraz.url) {
            embed.setImage(obraz.url);
        }

        // ID kanału, do którego embed ma być wysyłany (jeśli potrzebne)
        const channelId = '1299672680391245846';
        const channel = client.channels.cache.get(channelId);

        if (!channel) {
            await interaction.editReply({ content: 'Nie znaleziono kanału do wysłania wiadomości.' });
            return;
        }

        try {
            // Wyślij embed
            await channel.send({ embeds: [embed] });

            // ---------------------------------
            // ZAPIS DO GOOGLE SPREADSHEET (bez opcji "obraz")
            // ---------------------------------
            try {
                // Autoryzacja z użyciem pliku JSON
                const auth = new google.auth.GoogleAuth({
                    keyFile: 'src/bot-dc-449215-43833ac2c28c.json', // Ścieżka do Twojego pliku z kluczem serwisowym
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });

                // Uzyskanie klienta
                const authClient = await auth.getClient();
                const googleSheets = google.sheets({ version: 'v4', auth: authClient });

                // ID Twojego arkusza
                const spreadsheetId = '1Yt5bWu4AE56WVEVZNZSHbE3OU-83XXzqwGSIut1FrHQ';

                // Przygotowujemy dane do zapisania (bez opcji "obraz")
                const newData = [[pwc, apwc, iloscFP, kod, uwagi]];

                // Dodajemy wiersz do arkusza
                await googleSheets.spreadsheets.values.append({
                    auth,
                    spreadsheetId,
                    range: 'Arkusz1!A:E', // 5 kolumn
                    valueInputOption: 'RAW',
                    resource: {
                        values: newData,
                    },
                });
            } catch (error) {
                console.error('Błąd przy zapisie do Google Sheets:', error);
            }

            // Odpowiedź do użytkownika w Discord
            await interaction.editReply({ content: 'Wpis został wysłany do kanału i zapisany w Google Sheets.' });

        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'Wystąpił błąd podczas wysyłania wiadomości.' });
        }
    }
}).toJSON();
