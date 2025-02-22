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
        // Lista dozwolonych ID ról
        const allowedRoleIds = ['1328034957117100032', '1340974124306006127'];
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!allowedRoleIds.some(roleId => member.roles.cache.has(roleId))) {
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

        // Mapowanie kodu na emoji do zapisu w arkuszu
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

        // Lista ID kanałów, do których wysyłamy wiadomość
        const channelIds = ['1336019633966153799', '1342844967604846592'];

        // Wysyłamy embed do każdego z kanałów
        for (const channelId of channelIds) {
            const channel = client.channels.cache.get(channelId);
            if (!channel) continue;
            try {
                await channel.send({ embeds: [embed] });
            } catch (error) {
                console.error(`Błąd przy wysyłaniu wiadomości do kanału ${channelId}:`, error);
            }
        }

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
    }
}).toJSON();
