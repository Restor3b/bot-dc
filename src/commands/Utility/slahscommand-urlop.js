const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'urlop',
        description: 'Dodaj rangę urlop funkcjonraiuszowi',
        type: 1,
        options: [
            {
                name: 'powod_ooc',
                description: 'Powód urlopu (OOC)',
                type: 3, 
                required: true
            },
            {
                name: 'powod_ic',
                description: 'Powód urlopu (IC)',
                type: 3, 
                required: true
            },
            {
                name: 'do_kiedy',
                description: 'Data zakończenia urlopu (format: DD-MM-YYYY HH:mm)',
                type: 3, 
                required: true
            },
            {
                name: 'akcja',
                description: 'Dodaj lub usuń rangę urlop',
                type: 3, 
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
        const requiredRoleId = '1259796857291411558';
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.roles.cache.has(requiredRoleId)) {
            await interaction.reply({
                content: 'Nie masz uprawnień do użycia tej komendy.',
                ephemeral: true
            });
            return;
        }

        const targetMember = member;
        const action = interaction.options.getString('akcja');
        const reasonOOC = interaction.options.getString('powod_ooc');
        const reasonIC = interaction.options.getString('powod_ic');
        const untilDate = interaction.options.getString('do_kiedy');
        const author = interaction.user;

        const vacationRoleId = '1279535711510466601';
        if (action === 'add') {
            try {
                await targetMember.roles.add(vacationRoleId);
                const embed = new EmbedBuilder()
                    .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
                    .setTitle(`Ktoś poszedł na urlop`)
                    .setDescription(`Kto: <@${author.id}>`)
                    .addFields(
                        { name: '**------------------------------------------------------------------**', value: ' '},
                        { name: 'Powód (OOC): ', value: `${reasonOOC}`, inline: true },
                        { name: 'Powód (IC): ', value: `${reasonIC}`, inline: true },
                        { name: 'Data zakończenia: ', value: `${untilDate}`, inline: true },
                        { name: '**------------------------------------------------------------------**', value: ' ' }
                    )
                    .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
                    .setColor(0x2f3136)
                    .setThumbnail('https://media.discordapp.net/attachments/1293717333461827747/1299497166158565457/f85cc66dd65a679d957ca4d6c668d070.png?ex=672a998b&is=6729480b&hm=52ba417193a104ec17b01de39cca9f568b52373fb342b35b0355d8223d4d3e4c&=&format=webp&quality=lossless');

                const channelId = '1259796858654429286';
                const channel = client.channels.cache.get(channelId);
                if (channel) {
                    await channel.send({ embeds: [embed] });
                    await interaction.reply({
                        content: `Ranga urlop została dodana dla <@${targetMember.id}> do ${untilDate}.`,
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
                    content: `Ranga urlop została usunięta dla <@${targetMember.id}>.`,
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
                            .setDescription(`Ranga urlop została automatycznie usunięta użytkownikowi <@${targetMember.id}> po upływie okresu urlopu.`)
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