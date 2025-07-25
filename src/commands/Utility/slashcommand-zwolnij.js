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
          { id: "1396593618038423564", name: "Captain" },
          { id: "1396593618772430930", name: "Staff Lieutenant" },
          { id: "1396593620873641984", name: "Lieutenant" },
          { id: "1396593621557444771", name: "Staff Sergeant" },
          { id: "1396593622954016880", name: "Sergeant" },
          { id: "1396593626070388887", name: "Corporal First Class" },
          { id: "1396593625072402493", name: "Corporal Second Class" },
          { id: "1396593627081478165", name: "Senior Deputy" },
          { id: "1396593632118833354", name: "Deputy III" },
          { id: "1396593633456558090", name: "Deputy II" },
          { id: "1396593634106802189", name: "Deputy I" },
          { id: "1396593635537195141", name: "Probie Deputy" },
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
                { name: '**------------------------------------------------------------------**', value: ' ' },
                // Zmieniono wartość z <@${target.id}> na pseudonim z serwera
                { name: 'Funkcjonariusz: ', value: targetMember.displayName, inline: true },
                { name: 'Stopień: ', value: `${rank}`, inline: true },
                { name: 'Powód: ', value: `${reason}`, inline: true },
                { name: '**------------------------------------------------------------------**', value: ' ', inline: true }
            )
            .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
            .setColor(0xffffff)
            .setThumbnail('https://cdn.discordapp.com/attachments/1275544141488717884/1275544141790711949/image.png?ex=677ed88d&is=677d870d&hm=35f546225246cc162b81f0b803a8db9387ee69bcd537035adefd4527bc7546bf&');

        try {
            const channelId = '1259796858524536910';
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
