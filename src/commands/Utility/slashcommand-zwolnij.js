const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'zwolnij',
        description: 'Zwolnij funkcjonariusza z wydziału',
        type: 1, 
        options: [
            {
                name: 'osoba',
                description: 'Funkcjonariusz, który ma zostać zwolniony',
                type: 6, 
                required: true
            },
            {
                name: 'powod',
                description: 'Powód zwolnienia',
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
        if (target.id === interaction.user.id) {
            await interaction.reply({
                content: 'Nie możesz zwolnić samego siebie!',
                ephemeral: true
            });
            return;
        }
        const targetMember = interaction.guild.members.cache.get(target.id);
        const reason = interaction.options.getString('powod');
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
            .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
            .setTitle('Ktoś został zwolniony')
            .setDescription(`Kto wystawił: <@${author.id}>​`) 
            .addFields(
                { name: '**------------------------------------------------------------------**', value: ' '},
                { name: 'Funkcjonariusz: ', value: `<@${target.id}>`, inline: true},
                { name: 'Stopień: ', value: `${rank}`, inline: true },
                { name: 'Powód: ', value: `${reason}`, inline: true },
                { name: '**------------------------------------------------------------------**', value: ' ', inline: true }
            )
            .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
            .setColor(0x2f3136)
            .setThumbnail('https://media.discordapp.net/attachments/1293717333461827747/1299497166158565457/f85cc66dd65a679d957ca4d6c668d070.png?ex=671d6a8b&is=671c190b&hm=6313f2ba968894d2e2382d3878ee0103179b9fc7209d30ff68451397c33cfdf1&=&format=webp&quality=lossless');
        
        try {
            const channelId = '1299672680391245846'; 
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                await channel.send(`<@${target.id}>`);
                await channel.send({ embeds: [embed] });
                await interaction.reply({
                    content: 'Funkcjonariusz został zwolniony.',
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
