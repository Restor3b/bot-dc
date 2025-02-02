const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const { google } = require('googleapis');

module.exports = new ApplicationCommand({
    command: {
        name: 'c8',
        description: 'Nowy zapis kodu 8.',
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
        // Sprawdzamy, czy użytkownik posiada wymaganą rolę
        const requiredRoleId = '1299662554473435186'; 
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.roles.cache.has(requiredRoleId)) {
            await interaction.reply({
                content: 'Nie masz uprawnień do użycia tej komendy.',
                ephemeral: true
            });
            return;
        }

        // Odraczamy odpowiedź, aby uniknąć timeoutu
        await interaction.deferReply({ ephemeral: true });

        // Pobieramy dane z interakcji
        const pwc = interaction.options.getString('pwc');
        const apwc = interaction.options.getString('apwc');
        const iloscFP = interaction.options.getInteger('iloscfp');
        const kod = interaction.options.getString('kod'); // jako słowo
        const obraz = interaction.options.getAttachment('obraz');
        const uwagi = interaction.options.getString('uwagi') || 'Brak';

        // Mapowanie kodu na emoji do zapisu w arkuszu (używane tylko przy zapisie)
        const kodMapping = {
            zielony: '🟢',
            pomaranczowy: '🟠',
            czerwony: '🔴',
            czarny: '⚫'
        };
        const emojiKod = kodMapping[kod] || kod;

        // Budujemy embed zgodnie z wymaganym układem:
        const embed = new EmbedBuilder()
            .setTitle('Nowy zapis kodu 8')
            .setDescription('Szczegóły kodu:')
            .setColor('#2f3136')
            // Pierwszy rząd: PWC i APWC (inline)
            .addFields(
                { name: 'PWC', value: `**${pwc}**`, inline: true },
                { name: 'APWC', value: `**${apwc}**`, inline: true }
            )
            // Dodajemy pusty field, aby wymusić nowy wiersz
            .addFields({ name: ' ', value: ' ', inline: false })
            // Drugi rząd: Ilość FP i Kod (inline)
            .addFields(
                { name: 'Ilość FP', value: `**${iloscFP.toString()}**`, inline: true },
                { name: 'Kod', value: `**${kod}**`, inline: true }
            )
            // Trzeci rząd: Uwagi (pełna szerokość)
            .addFields({ name: 'Uwagi', value: uwagi, inline: false });

        // Dodajemy obraz, jeśli został załączony
        if (obraz && obraz.url) {
            embed.setImage(obraz.url);
        }

        // Dodajemy stopkę z datą systemową
        const systemDate = new Date().toLocaleString();
        embed.setFooter({ text: `Data: ${systemDate}` });

        // Pobieramy kanał, na który wysyłamy embed
        const channelId = '1299672680391245846';
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            await interaction.editReply({ content: 'Nie znaleziono kanału do wysłania wiadomości.' });
            return;
        }

        try {
            // Wysyłamy embed do kanału
            await channel.send({ embeds: [embed] });

            // ---------------------------------
            // ZAPIS DO GOOGLE SPREADSHEET (bez obrazu)
            // ---------------------------------
            try {
                const auth = new google.auth.GoogleAuth({
                    keyFile: 'src/bot-dc-449215-43833ac2c28c.json', // Ścieżka do pliku z kluczem serwisowym
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
                const authClient = await auth.getClient();
                const googleSheets = google.sheets({ version: 'v4', auth: authClient });
                // Używamy podanego ID arkusza
                const spreadsheetId = '1fjlB6XmGkhzDnHfeyAFSYkRuMCeCzbYKEbvG_IBnRjo';

                // Przygotowujemy dane do zapisu (dla arkusza używamy emoji dla pola "Kod")
                const newData = [[pwc, apwc, iloscFP, emojiKod, uwagi]];

                await googleSheets.spreadsheets.values.append({
                    auth,
                    spreadsheetId,
                    range: 'Arkusz1!A:E',
                    valueInputOption: 'RAW',
                    resource: { values: newData },
                });
            } catch (error) {
                console.error('Błąd przy zapisie do Google Sheets:', error);
            }

            // Odpowiadamy użytkownikowi
            await interaction.editReply({ content: 'Wpis został wysłany do kanału i zapisany w Google Sheets.' });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'Wystąpił błąd podczas wysyłania wiadomości.' });
        }
    }
}).toJSON();
