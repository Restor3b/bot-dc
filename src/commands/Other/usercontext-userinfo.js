const { ChatInputCommandInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'userinfo',
        description: 'Pokaż informację o użytkowniku',
        type: 1, 
        options: [
            {
                name: 'osoba',
                description: 'Informacje:',
                type: 6, 
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
        const target = interaction.options.getUser('osoba');
        const member = interaction.guild.members.cache.get(target.id);

        if (!member) {
            await interaction.reply({
                content: `Zła osoba!`,
                ephemeral: true
            });
            return;
        }

        const roles = member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.name).join(', ');

        const joinedDate = member.joinedAt;
        const formattedDate = `${joinedDate.getDate().toString().padStart(2, '0')}.${(joinedDate.getMonth() + 1).toString().padStart(2, '0')}.${joinedDate.getFullYear()} ${joinedDate.getHours().toString().padStart(2, '0')}:${joinedDate.getMinutes().toString().padStart(2, '0')}`;

        const array = [
            `**Nick:** ${member.displayName}`,
            `**Role:** ${roles}`,
            `**Discord id:** ${member.id}`,
            `**Data dołączenia:** ${formattedDate}`
        ];

        await interaction.reply({
            content: array.join('\n'),
            ephemeral: true
        });
    }
}).toJSON();