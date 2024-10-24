const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'zwolnij',
        description: 'Zwolnij użytkownika z wydziału',
        type: 1, 
        options: [
            {
                name: 'osoba',
                description: 'Użytkownik, który ma zostać zwolniony',
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
        const reason = interaction.options.getString('powod');
        const author = interaction.user;

        if (!targetMember) {
            await interaction.reply({
                content: 'Nieprawidłowa osoba!',
                ephemeral: true
            });
            return;
        }

        const rankRoles = {
            '1294004673098809364': 'Staff Captain',
            '1294004633693585530': 'Captain',
            'ROLE_ID_3': 'Staff Lieutenant',
            'ROLE_ID_4': 'Lieutenant',
            'ROLE_ID_5': 'Master Sergeant',
            'ROLE_ID_6': 'Staff Sergeant',
            'ROLE_ID_7': 'Sergeant',
            'ROLE_ID_8': 'Corporal First Class',
            'ROLE_ID_9': 'Corporal Second Class',
            'ROLE_ID_10': 'Senior Deputy',
            'ROLE_ID_11': 'Deputy',
            'ROLE_ID_12': 'Probie Deputy'
        };

        let rank = null;
        for (const [roleId, rankName] of Object.entries(rankRoles)) {
            if (targetMember.roles.cache.has(roleId)) {
                rank = rankName;
                break;
            }
        }

        if (!rank) {
            await interaction.reply({
                content: 'Nie udało się ustalić stopnia użytkownika.',
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
                { name: 'Kto: ', value: `<@${target.id}>`, inline: true},
                { name: 'Stopień: ', value: `${rank}`, inline: true, },
                { name: 'Powód: ', value: `${reason}`, inline: true },
                { name: '**------------------------------------------------------------------**', value: ' ', inline: true }
            )
            .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
            .setColor(0x2f3136)
            .setThumbnail('https://cdn.discordapp.com/attachments/1293986296418668599/1294647977142521917/f85cc66dd65a679d957ca4d6c668d070.png?ex=670d17e3&is=670bc663&hm=cc500303fb01ac544a5036008de0cb145c3805001c28bbf077fcb3a71ac90280&');
        
        try {
            const channelId = '1294040234853404765'; 
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                await channel.send({ embeds: [embed] });
                await interaction.reply({
                    content: 'Ktoś został zwolniony.',
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
            await interaction.followUp({
                content: 'Nie udało się usunąć ról od użytkownika.',
                ephemeral: true
            });
        }
    }
}).toJSON();