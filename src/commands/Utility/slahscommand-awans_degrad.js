const { ChatInputCommandInteraction, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'stopien',
        description: 'Awansuj lub zdegraduj funkcjonariusza',
        type: 1,
        options: [
            {
                name: 'osoba',
                description: 'Funkcjonariusz, którego stopień zmieniasz',
                type: 6,
                required: true
            },
            {
                name: 'powod',
                description: 'Powód zmiany stopnia',
                type: 3, 
                required: true
            },
            {
                name: 'nr_odznaki_przed',
                description: 'Numer odznaki przed zmianą',
                type: 3, 
                required: true
            },
            {
                name: 'nr_odznaki_po',
                description: 'Numer odznaki po zmianie',
                type: 3, 
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
        const requiredRoleId = '1299662554473435186';
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
            { id: '1297147165654777867', name: 'Captain' },
            { id: '1297147062756049008', name: 'Staff Lieutenant' },
            { id: '1292964686408454195', name: 'Lieutenant' },
            { id: '1259796857312247912', name: 'Master Sergeant' },
            { id: '1292965455966769276', name: 'Staff Sergeant' },
            { id: '1259796857312247910', name: 'Sergeant' },
            { id: '1259796857312247909', name: 'Corporal Second Class' },
            { id: '1274804209287561328', name: 'Corporal First Class' },
            { id: '1259796857303863314', name: 'Master Deputy' },
            { id: '1259796857303863313', name: 'Senior Deputy' },
            { id: '1259796857303863312', name: 'Deputy III' },
            { id: '1259796857303863311', name: 'Deputy II' },
            { id: '1259796857303863310', name: 'Deputy I' },
            { id: '1259796857303863309', name: 'Probie Deputy' }
        ];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('rank_selection')
            .setPlaceholder('Wybierz nowy stopień funkcjonariusza')
            .addOptions(rankRoles.map(rank => ({
                label: rank.name,
                value: rank.id
            })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Wybierz nowy stopień dla funkcjonariusza:',
            components: [row],
            ephemeral: true
        });

        const filter = (i) => i.customId === 'rank_selection' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (i) => {
            const newRankId = i.values[0];
            const newRank = rankRoles.find(rank => rank.id === newRankId);

            try {
                await targetMember.roles.add(newRank.id);
                await targetMember.roles.remove(rankRoles.filter(role => role.id !== newRank.id).map(role => role.id));

                const embed = new EmbedBuilder()
                    .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
                    .setTitle(`Zmiana stopnia funkcjonariusza`)
                    .setDescription(`Kto dokonał zmiany: <@${author.id}>`)
                    .addFields(
                        { name: '**------------------------------------------------------------------**', value: ' '},
                        { name: 'Funkcjonariusz: ', value: `<@${target.id}>`, inline: true},
                        { name: 'Nowy stopień: ', value: `${newRank.name}`, inline: true },
                        { name: 'Powód: ', value: `${reason}`, inline: true },
                        { name: 'Nr odznaki przed: ', value: `${badgeNumberBefore}`, inline: true },
                        { name: 'Nr odznaki po: ', value: `${badgeNumberAfter}`, inline: true },
                        { name: ' ', value: ' ', inline: true },
                        { name: '**------------------------------------------------------------------**', value: ' ', inline: true }
                    )
                    .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
                    .setColor(0x2f3136)
                    .setThumbnail('');

                const channelId = '1259796858524536912';
                let channel = client.channels.cache.get(channelId);
                if (!channel) {
                    await i.reply({
                        content: 'Nie udało się znaleźć określonego kanału.',
                        ephemeral: true
                    });
                    return;
                }
                await channel.send(`<@${target.id}>`);
                if (channel) {
                    await channel.send({ embeds: [embed] });
                    await i.reply({
                        content: `Funkcjonariusz został zmieniony na stopień ${newRank.name}.`,
                        ephemeral: true
                    });
                } else {
                    await i.reply({
                        content: 'Nie udało się znaleźć określonego kanału.',
                        ephemeral: true
                    });
                }
            } catch (err) {
                console.error(err);
                await i.reply({
                    content: 'Nie udało się zmienić rangi użytkownika.',
                    ephemeral: true
                });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({
                    content: 'Czas na wybór stopnia minął.',
                    ephemeral: true
                });
            }
        });
    }
}).toJSON();
