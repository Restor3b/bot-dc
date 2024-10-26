const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'urlop',
        description: 'Dodaj rangę urlop użytkownikowi',
        type: 1,
        options: [
            {
                name: 'osoba',
                description: 'Funkcjonariusz, któremu dodajesz rangę urlop',
                type: 6, // USER type
                required: true
            },
            {
                name: 'powod_ooc',
                description: 'Powód urlopu (OOC)',
                type: 3, // STRING type
                required: true
            },
            {
                name: 'powod_ic',
                description: 'Powód urlopu (IC)',
                type: 3, // STRING type
                required: true
            },
            {
                name: 'do_kiedy',
                description: 'Data zakończenia urlopu (format: DD-MM-YYYY HH:mm)',
                type: 3, // STRING type
                required: true
            },
            {
                name: 'akcja',
                description: 'Dodaj lub usuń rangę urlop',
                type: 3, // STRING type
                required: true,
                choices: [
                    {
                        name: 'Dodaj',
                        value: 'add'
                    },
                    {
                        name: 'Usuń',
                        value: 'remove'
                    }
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
        const requiredRoleId = '1294040412184641627';
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.roles.cache.has(requiredRoleId)) {
            await interaction.reply({
                content: 'Nie masz uprawnień do użycia tej komendy.',
                ephemeral: true
            });
            return;
        }

        const target = interaction.options.getUser('osoba');
        const targetMember = interaction.guild.members.cache.get(target.id);
        const action = interaction.options.getString('akcja');
        const reasonOOC = interaction.options.getString('powod_ooc');
        const reasonIC = interaction.options.getString('powod_ic');
        const untilDate = interaction.options.getString('do_kiedy');
        const author = interaction.user;

        if (!targetMember) {
            await interaction.reply({
                content: 'Nieprawidłowa osoba!',
                ephemeral: true
            });
            return;
        }

        const vacationRoleId = '1295126992387178556';
        if (action === 'add') {
            try {
                await targetMember.roles.add(vacationRoleId);
                const embed = new EmbedBuilder()
                    .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
                    .setTitle(`Ktoś poszedł na urlop`)
                    .setDescription(`Kto: <@${author.id}>
                    Powód (OOC): ${reasonOOC}
                    Powód (IC): ${reasonIC}
                    Data zakończenia: ${untilDate}`)
                    .addFields(
                        { name: '**------------------------------------------------------------------**', value: ' '},
                        { name: ': ', value: `<@${target.id}>`, inline: true },
                        { name: 'Urlop został nadany', value: '✅', inline: true },
                        { name: '**------------------------------------------------------------------**', value: ' ' }
                    )
                    .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
                    .setColor(0x2f3136)
                    .setThumbnail('https://media.discordapp.net/attachments/1293717333461827747/1299497166158565457/f85cc66dd65a679d957ca4d6c668d070.png?ex=671d6a8b&is=671c190b&hm=6313f2ba968894d2e2382d3878ee0103179b9fc7209d30ff68451397c33cfdf1&=&format=webp&quality=lossless');

                const channelId = '1294040234853404765';
                const channel = client.channels.cache.get(channelId);
                if (channel) {
                    await channel.send({ embeds: [embed] });
                    await interaction.reply({
                        content: `Ranga urlop została dodana dla <@${target.id}> do ${untilDate}.`,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: 'Nie udało się znaleźć określonego kanału.',
                        ephemeral: true
                    });
                }
            } catch (err) {
                await interaction.followUp({
                    content: 'Nie udało się dodać rangi urlop.',
                    ephemeral: true
                });
            }
        } else if (action === 'remove') {
            try {
                await targetMember.roles.remove(vacationRoleId);
                await interaction.reply({
                    content: `Ranga urlop została usunięta dla <@${target.id}>.`,
                    ephemeral: true
                });
            } catch (err) {
                await interaction.followUp({
                    content: 'Nie udało się usunąć rangi urlop.',
                    ephemeral: true
                });
            }
        }

        
        if (action === 'add') {
            const untilDateTime = new Date(untilDate);
            const currentTime = new Date();
            const timeoutDuration = untilDateTime - currentTime;

            if (timeoutDuration > 0) {
                setTimeout(async () => {
                    try {
                        await targetMember.roles.remove(vacationRoleId);
                        const autoRemoveEmbed = new EmbedBuilder()
                            .setTitle(`Automatyczne usunięcie rangi urlop`)
                            .setDescription(`Ranga urlop została automatycznie usunięta użytkownikowi <@${target.id}> po upływie okresu urlopu.`)
                            .setColor(0x2f3136);

                        if (channel) {
                            await channel.send({ embeds: [autoRemoveEmbed] });
                        }
                    } catch (err) {
                        console.error('Nie udało się automatycznie usunąć rangi urlop:', err);
                    }
                }, timeoutDuration);
            }
        }
    }
}).toJSON();