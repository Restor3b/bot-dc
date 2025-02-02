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
                name: 'obraz',
                description: 'Załącz obraz',
                type: 11, // Attachment
                required: true
            },
            {
                name: 'uwagi',
                description: 'Uwagi',
                type: 3,
                required: false
            }
        ]
    },
    options: {
        cooldown: 5000
    },
    /**
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        // Sprawdzenie uprawnień użytkownika (wymagana rola)
        const requiredRoleId = '1299662554473435186'; 
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.roles.cache.has(requiredRoleId)) {
            await interaction.reply({
                content: 'Nie masz uprawnień do użycia tej komendy.',
                ephemeral: true
            });
            return;
        }

        // Odroczenie odpowiedzi, aby uniknąć timeoutu
        await interaction.deferReply({ ephemeral: true });

        // Pobieranie danych z opcji interakcji
        const pwc = interaction.options.getString('pwc');
        const apwc = interaction.options.getString('apwc');
        const iloscFP = interaction.options.getInteger('iloscfp');
        const kod = interaction.options.getString('kod');  // Wybrana wartość jako słowo
        const obraz = interaction.options.getAttachment('obraz'); // Załączony obraz
        const uwagi = interaction.options.getString('uwagi') || 'Brak';

        // Mapowanie wartości kodu na emoji do zapisu w Google Sheets
        const kodMapping = {
            zielony: '🟢',
            pomaranczowy: '🟠',
            czerwony: '🔴',
            czarny: '⚫'
        };
        const emojiKod = kodMapping[kod] || kod;

        // Budowanie embeda zgodnie z wymaganiami
        const embed = new EmbedBuilder()
            .setTitle('Nowy C8')
            .setDescription('Szczegóły:')
            .setColor('#2f3136')
            // Pierwszy rząd: PWC i APWC
            .addFields(
                { name: 'PWC', value: `**${pwc}**`, inline: true },
                { name: 'APWC', value: `**${apwc}**`, inline: true }
            )
            // Drugi rząd: Ilość FP i Kod (jako słowo)
            .addFields(
                { name: 'Ilość FP', value: `**${iloscFP.toString()}**`, inline: true },
                { name: 'Kod', value: `**${kod}**`, inline: true }
            )
            // Trzeci rząd: Uwagi (pełna szerokość)
            .addFields(
                { name: 'Uwagi', value: uwagi }
            );

        // Dodanie obrazu, jeśli został załączony
        if (obraz && obraz.url) {
            embed.setImage(obraz.url);
        }

        // Dodanie stopki z datą systemową
        const systemDate = new Date().toLocaleString();
        embed.setFooter({ text: `Data: ${systemDate}` });

        // Wysyłanie embeda na określony kanał
        const channelId = '1299672680391245846';
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            await interaction.editReply({ content: 'Nie znaleziono kanału do wysłania wiadomości.' });
            return;
        }

        try {
            // Wysłanie embeda do kanału
            await channel.send({ embeds: [embed] });

            // ---------------------------------
            // ZAPIS DO GOOGLE SPREADSHEET (bez obrazu)
            // ---------------------------------
            try {
                // Autoryzacja z użyciem pliku JSON
                const auth = new google.auth.GoogleAuth({
                    keyFile: 'src/bot-dc-449215-43833ac2c28c.json', // Ścieżka do pliku z kluczem serwisowym
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });

                // Uzyskanie klienta i obiektu Google Sheets
                const authClient = await auth.getClient();
                const googleSheets = google.sheets({ version: 'v4', auth: authClient });
                const spreadsheetId = '1fjlB6XmGkhzDnHfeyAFSYkRuMCeCzbYKEbvG_IBnRjo';

                // Przygotowanie danych do zapisania (kod wysyłany jako emoji)
                const newData = [[pwc, apwc, iloscFP, emojiKod, uwagi]];

                // Dodanie wiersza do arkusza
                await googleSheets.spreadsheets.values.append({
                    auth,
                    spreadsheetId,
                    range: 'Arkusz1!A:E',
                    valueInputOption: 'RAW',
                    resource: {
                        values: newData,
                    },
                });
            } catch (error) {
                console.error('Błąd przy zapisie do Google Sheets:', error);
            }

            // Odpowiedź do użytkownika
            await interaction.editReply({ content: 'Wpis został wysłany do kanału i zapisany w Google Sheets.' });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'Wystąpił błąd podczas wysyłania wiadomości.' });
        }
    }
}).toJSON();
