const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'wypowiedzenie',
        description: 'Wypowiedzenie funkcjonariusza z wydziału',
        type: 1,
        options: [
            {
                name: 'powod',
                description: 'Powód wypowiedzenia',
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
        const requiredRoleId = '1259796857291411558';
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.roles.cache.has(requiredRoleId)) {
            await interaction.reply({
                content: 'Nie masz uprawnień do użycia tej komendy.',
                ephemeral: true
            });
            return;
        }
        const targetMember = interaction.guild.members.cache.get(interaction.user.id);
        const reason = interaction.options.getString('powod');
        const author = interaction.user;

        const rankRoles = [
            { id: '1297147165654777867', name: 'Captain' },
            { id: '1297147062756049008', name: 'Staff Lieutenant' },
            { id: '1292964686408454195', name: 'Lieutenant' },
            { id: '1259796857312247912', name: 'Master Sergeant' },
            { id: '1292965455966769276', name: 'Staff Sergeant' },
            { id: '1259796857312247910', name: 'Sergeant' },
            { id: '1274804209287561328', name: 'Corporal First Class' },
            { id: '1259796857312247909', name: 'Corporal Second Class' },
            { id: '1259796857303863314', name: 'Master Deputy' },
            { id: '1259796857303863313', name: 'Senior Deputy' },
            { id: '1259796857303863312', name: 'Deputy III' },
            { id: '1259796857303863311', name: 'Deputy II' },
            { id: '1259796857303863310', name: 'Deputy I' },
            { id: '1259796857303863309', name: 'Probie Deputy' }
        ];

        let rank = null;
        for (const role of rankRoles) {
            if (targetMember.roles.cache.has(role.id)) {
                rank = role.name;
                break;
            }
        }

        if (!rank) {
            await interaction.reply({
                content: 'Nie udało się ustalić stopnia funkcjonariusza.',
                ephemeral: true
            });
            return;
        }

        const embed = new EmbedBuilder()
            // Używamy targetMember.displayName, by wyświetlić nick z serwera
            .setAuthor({ name: targetMember.displayName, iconURL: author.displayAvatarURL() })
            .setTitle('Ktoś złożył wypowiedzenie')
            .setDescription(`Kto złożył: <@${author.id}>`)
            .addFields(
                { name: '**------------------------------------------------------------------**', value: ' ' },
                { name: 'Funkcjonariusz: ', value: targetMember.displayName, inline: true },
                { name: 'Stopień: ', value: `${rank}`, inline: true },
                { name: 'Powód: ', value: `${reason}`, inline: true },
                { name: '**------------------------------------------------------------------**', value: ' ', inline: true }
            )
            .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
            .setColor(0x2f3136)
            .setThumbnail('https://cdn.discordapp.com/attachments/1275544141488717884/1275544141790711949/image.png?ex=677ed88d&is=677d870d&hm=35f546225246cc162b81f0b803a8db9387ee69bcd537035adefd4527bc7546bf&');

        try {
            const channelId = '1259796858524536911';
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                await channel.send(`<@${author.id}>`);
                await channel.send({ embeds: [embed] });
                await interaction.reply({
                    content: 'Wypowiedzenie zostało złożone.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'Nie udało się znaleźć określonego kanału.',
                    ephemeral: true
                });
            }
            await targetMember.roles.set([]);
        } catch (err) {
            console.error(err);
            await interaction.followUp({
                content: 'Nie udało się usunąć ról od funkcjonariusza.',
                ephemeral: true
            });
        }
    }
}).toJSON();
