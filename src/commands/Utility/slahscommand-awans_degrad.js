const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'stopien',
        description: 'Awansuj lub zdegraduj użytkownika',
        type: 1,
        options: [
            {
                name: 'osoba',
                description: 'Użytkownik, którego stopień zmieniasz',
                type: 6, // USER type
                required: true
            },
            {
                name: 'akcja',
                description: 'Wybierz akcję: awans lub degradacja',
                type: 3, // STRING type
                required: true,
                choices: [
                    {
                        name: 'Awans',
                        value: 'promote'
                    },
                    {
                        name: 'Degradacja',
                        value: 'demote'
                    }
                ]
            },
            {
                name: 'powod',
                description: 'Powód zmiany stopnia',
                type: 3, // STRING type
                required: true
            },
            {
                name: 'nr_odznaki_przed',
                description: 'Numer odznaki przed zmianą',
                type: 3, // STRING type
                required: true
            },
            {
                name: 'nr_odznaki_po',
                description: 'Numer odznaki po zmianie',
                type: 3, // STRING type
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
        const reason = interaction.options.getString('powod');
        const badgeNumberBefore = interaction.options.getString('nr_odznaki_przed');
        const badgeNumberAfter = interaction.options.getString('nr_odznaki_po');
        const author = interaction.user;

        if (!targetMember) {
            await interaction.reply({
                content: 'Nieprawidłowa osoba!',
                ephemeral: true
            });
            return;
        }

        const rankRoles = [
            { id: '1294004673098809364', name: 'Staff Captain' },
            { id: '1294004633693585530', name: 'Captain' },
            { id: 'ROLE_ID_3', name: 'Staff Lieutenant' },
            { id: 'ROLE_ID_4', name: 'Lieutenant' },
            { id: 'ROLE_ID_5', name: 'Master Sergeant' },
            { id: 'ROLE_ID_6', name: 'Staff Sergeant' },
            { id: 'ROLE_ID_7', name: 'Sergeant' },
            { id: 'ROLE_ID_8', name: 'Corporal First Class' },
            { id: 'ROLE_ID_9', name: 'Corporal Second Class' },
            { id: 'ROLE_ID_10', name: 'Senior Deputy' },
            { id: 'ROLE_ID_11', name: 'Deputy' },
            { id: 'ROLE_ID_12', name: 'Probie Deputy' }
        ];

        let currentRankIndex = rankRoles.findIndex(role => targetMember.roles.cache.has(role.id));
        if (currentRankIndex === -1) {
            await interaction.reply({
                content: 'Nie udało się ustalić stopnia użytkownika.',
                ephemeral: true
            });
            return;
        }

        let newRankIndex;
        if (action === 'promote') {
            if (currentRankIndex === 0) {
                await interaction.reply({
                    content: 'Użytkownik ma już najwyższy stopień.',
                    ephemeral: true
                });
                return;
            }
            newRankIndex = currentRankIndex - 1;
        } else if (action === 'demote') {
            if (currentRankIndex === rankRoles.length - 1) {
                await interaction.reply({
                    content: 'Użytkownik ma już najniższy stopień.',
                    ephemeral: true
                });
                return;
            }
            newRankIndex = currentRankIndex + 1;
        }

        const newRank = rankRoles[newRankIndex];
        try {
            await targetMember.roles.add(newRank.id);
            const rolesToRemove = rankRoles.filter(role => role.id !== newRank.id).map(role => role.id);
            await targetMember.roles.remove(rolesToRemove).catch(console.error);
            const embed = new EmbedBuilder()
                .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
                .setTitle(`Zmiana stopnia funckjonariusza`)
                .setDescription(`Kto dokonał zmiany: <@${author.id}>`)
                .addFields(
                    { name: '**--------------------------------------------------------------------------**', value: ' '},
                    { name: 'Funkcjonariusz: ', value: `<@${target.id}>`, inline: true},
                    { name: 'Nowy stopień: ', value: `${newRank.name}`, inline: true },
                    { name: 'Powód: ', value: `${reason}`, inline: true },
                    { name: 'Nr odznaki przed: ', value: `${badgeNumberBefore}`, inline: true },
                    { name: 'Nr odznaki po: ', value: `${badgeNumberAfter}`, inline: true },
                    { name: ' ', value: ' ', inline: true },
                    { name: '**--------------------------------------------------------------------------**', value: ' ', inline: true }
                )
                .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
                .setColor(0x2f3136)
                .setThumbnail('https://imgur.com/sXiVVbjhttps://media.discordapp.net/attachments/1293717333461827747/1299497166158565457/f85cc66dd65a679d957ca4d6c668d070.png?ex=671d6a8b&is=671c190b&hm=6313f2ba968894d2e2382d3878ee0103179b9fc7209d30ff68451397c33cfdf1&=&format=webp&quality=lossless');

            const channelId = '1294040234853404765';
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                await channel.send({ embeds: [embed] });
                await interaction.reply({
                    content: `Użytkownik został ${action === 'promote' ? 'awansowany' : 'zdegradowany'} na stopień ${newRank.name}.`,
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
                content: 'Nie udało się zmienić rangi użytkownika.',
                ephemeral: true
            });
        }
    }
}).toJSON();