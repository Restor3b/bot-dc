const { ChatInputCommandInteraction } = require("discord.js");
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
            },
            {
                name: 'stopien',
                description: 'Wybierz nowy stopień',
                type: 3,
                required: true,
                choices: [
                    { name: 'Captain', value: 'Captain' },
                    { name: 'Staff Lieutenant', value: 'Staff Lieutenant' },
                    { name: 'Lieutenant', value: 'Lieutenant' },
                    { name: 'Master Sergeant', value: 'Master Sergeant' },
                    { name: 'Staff Sergeant', value: 'Staff Sergeant' },
                    { name: 'Sergeant', value: 'Sergeant' },
                    { name: 'Corporal Second Class', value: 'Corporal Second Class' },
                    { name: 'Corporal First Class', value: 'Corporal First Class' },
                    { name: 'Master Deputy', value: 'Master Deputy' },
                    { name: 'Senior Deputy', value: 'Senior Deputy' },
                    { name: 'Deputy III', value: 'Deputy III' },
                    { name: 'Deputy II', value: 'Deputy II' },
                    { name: 'Deputy I', value: 'Deputy I' },
                    { name: 'Probie Deputy', value: 'Probie Deputy' }
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
        const newRank = interaction.options.getString('stopien');
        const author = interaction.user;

        if (!targetMember) {
            await interaction.reply({
                content: 'Nieprawidłowa osoba!',
                ephemeral: true
            });
            return;
        }

        const rankRoles = {
            'Captain': '1297147165654777867',
            'Staff Lieutenant': '1297147062756049008',
            'Lieutenant': '1292964686408454195',
            'Master Sergeant': '1259796857312247912',
            'Staff Sergeant': '1292965455966769276',
            'Sergeant': '1259796857312247910',
            'Corporal Second Class': '1259796857312247909',
            'Corporal First Class': '1274804209287561328',
            'Master Deputy': '1259796857303863314',
            'Senior Deputy': '1259796857303863313',
            'Deputy III': '1259796857303863312',
            'Deputy II': '1259796857303863311',
            'Deputy I': '1259796857303863310',
            'Probie Deputy': '1259796857303863309'
        };

        const newRankId = rankRoles[newRank];
        if (!newRankId) {
            await interaction.reply({
                content: 'Nieprawidłowy stopień!',
                ephemeral: true
            });
            return;
        }

        try {
            await targetMember.roles.add(newRankId);
            await targetMember.roles.remove(Object.values(rankRoles).filter(roleId => roleId !== newRankId));

            const embed = new EmbedBuilder()
                .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
                .setTitle(`Zmiana stopnia funkcjonariusza`)
                .setDescription(`Kto dokonał zmiany: <@${author.id}>`)
                .addFields(
                    { name: '**------------------------------------------------------------------**', value: ' '},
                    { name: 'Funkcjonariusz: ', value: `<@${target.id}>`, inline: true},
                    { name: 'Nowy stopień: ', value: `${newRank}`, inline: true },
                    { name: 'Powód: ', value: `${reason}`, inline: true },
                    { name: 'Nr odznaki przed: ', value: `${badgeNumberBefore}`, inline: true },
                    { name: 'Nr odznaki po: ', value: `${badgeNumberAfter}`, inline: true },
                    { name: ' ', value: ' ', inline: true },
                    { name: '**------------------------------------------------------------------**', value: ' ', inline: true }
                )
                .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
                .setColor(0x2f3136)
                .setThumbnail('https://media.discordapp.net/attachments/1293717333461827747/1299497166158565457/f85cc66dd65a679d957ca4d6c668d070.png?ex=67371fcb&is=6735ce4b&hm=61111b91dbed6885f3246c0df49727602aed4e3ace52730dfe9f988e4167fbd8&=&format=webp&quality=lossless');

            const channelId = '1259796858524536912';
            let channel = client.channels.cache.get(channelId);
            if (!channel) {
                await interaction.reply({
                    content: 'Nie udało się znaleźć określonego kanału.',
                    ephemeral: true
                });
                return;
            }
            await channel.send(`<@${target.id}>`);
            if (channel) {
                await channel.send({ embeds: [embed] });
                await interaction.reply({
                    content: `Funkcjonariusz został zmieniony na stopień ${newRank}.`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'Nie udało się znaleźć określonego kanału.',
                    ephemeral: true
                });
            }
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: 'Nie udało się zmienić rangi użytkownika.',
                ephemeral: true
            });
        }
    }
}).toJSON();
