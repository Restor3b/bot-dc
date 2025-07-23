const { ChatInputCommandInteraction, EmbedBuilder, User } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'zatrudnij',
        description: 'Zatrudnij funkcjonariusza - nadaj odpowiednie rangi',
        type: 1,
        options: [
            {
                name: 'Kogo',
                description: 'Kogo chcesz zatrudnić',
                type: 6, // USER
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
        const requiredRoleId = '1397689140111216761';
        const member = interaction.guild.members.cache.get(interaction.user.id);

        if (!member.roles.cache.has(requiredRoleId)) {
            await interaction.reply({
                content: 'Nie masz uprawnień do użycia tej komendy.',
                ephemeral: true
            });
            return;
        }

        const targetUser = interaction.options.getUser('uzytkownik');
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        const author = interaction.user;

        const roleIdsToAssign = [
            '1396593617346232531',
            '1396593635537195141',
            '1396593652733575320'
        ];

        const channelId = '1397689520970793080';
        const channel = client.channels.cache.get(channelId);

        try {
            for (const roleId of roleIdsToAssign) {
                await targetMember.roles.add(roleId);
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
                .setTitle(`Zatrudniono nową osobę`)
                .setDescription(`Kogo: <@${targetUser.id}>`)
                .addFields(
                    { name: '**Przez**', value: `<@${author.id}>`, inline: true },
                    { name: '**Data**', value: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }), inline: true }
                )
                .setColor(0x00ff00)
                .setThumbnail('https://cdn.discordapp.com/attachments/1275544141488717884/1275544141790711949/image.png?ex=677ed88d&is=677d870d&hm=35f546225246cc162b81f0b803a8db9387ee69bcd537035adefd4527bc7546bf&');

            if (channel) {
                await channel.send({ content: `<@${targetUser.id}>`, embeds: [embed] });
            }

            await interaction.reply({
                content: `Pomyślnie zatrudniono <@${targetUser.id}> i nadano rangi.`,
                ephemeral: true
            });

        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: 'Wystąpił błąd podczas zatrudniania użytkownika.',
                ephemeral: true
            });
        }
    }
}).toJSON();
