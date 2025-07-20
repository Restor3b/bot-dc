const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
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
        await interaction.deferReply({ ephemeral: true });
        const requiredRoleId = '1299662554473435186';
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.roles.cache.has(requiredRoleId)) {
            await interaction.editReply({ content: 'Nie masz uprawnień do użycia tej komendy.' });
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
            await interaction.editReply({ content: 'Nie masz uprawnień do użycia tej komendy.' });
            return;
        }

      
        const rankRoles = {
            'Captain': '1396593618038423564',
            'Staff Lieutenant': '1396593618772430930',
            'Lieutenant': '1396593620873641984',
            'Staff Sergeant': '1396593621557444771',
            'Sergeant': '1396593622954016880',
            'Corporal Second Class': '1396593625072402493',
            'Corporal First Class': '1396593626070388887',
            'Senior Deputy': '1396593627081478165',
            'Deputy III': '1396593632118833354',
            'Deputy II': '1396593633456558090',
            'Deputy I': '1396593634106802189',
            'Probie Deputy': '1396593635537195141'
        };

        const newRankId = rankRoles[newRank];
        if (!newRankId) {
            await interaction.editReply({ content: 'Nie masz uprawnień do użycia tej komendy.' });
            return;
        }

       
        const rankOrder = [
            'Captain',
            'Staff Lieutenant',
            'Lieutenant',
            'Staff Sergeant',
            'Sergeant',
            'Corporal Second Class',
            'Corporal First Class',
            'Senior Deputy',
            'Deputy III',
            'Deputy II',
            'Deputy I',
            'Probie Deputy'
        ];

       
        let currentRank = null;
        let currentRankIndex = -1;
        for (let i = 0; i < rankOrder.length; i++) {
            let roleId = rankRoles[rankOrder[i]];
            if (targetMember.roles.cache.has(roleId)) {
                currentRank = rankOrder[i];
                currentRankIndex = i;
                break;
            }
        }

        const newRankIndex = rankOrder.indexOf(newRank);
        let isPromotion = true;
        if (currentRankIndex !== -1) {
           
            isPromotion = newRankIndex < currentRankIndex;
        }
       

        try {
           
            await targetMember.roles.add(newRankId);
            await targetMember.roles.remove(Object.values(rankRoles).filter(roleId => roleId !== newRankId));

            let embed;
            if (isPromotion) {
                embed = new EmbedBuilder()
                    .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
                    .setTitle(`Awans funkcjonariusza`)
                    .setDescription(`Awans został nadany przez <@${author.id}>`)
                    .addFields(
                        { name: 'Funkcjonariusz:', value: `<@${target.id}>`, inline: true },
                        { name: 'Poprzedni stopień:', value: currentRank ? currentRank : 'Brak', inline: true },
                        { name: 'Nowy stopień:', value: newRank, inline: true },
                        { name: 'Powód:', value: reason, inline: true },
                        { name: 'Nr odznaki przed:', value: badgeNumberBefore, inline: true },
                        { name: 'Nr odznaki po:', value: badgeNumberAfter, inline: true }
                    )
                    .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
                    .setColor(0x00ff00)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1275544141488717884/1275544141790711949/image.png?ex=677ed88d&is=677d870d&hm=35f546225246cc162b81f0b803a8db9387ee69bcd537035adefd4527bc7546bf&');
            } else {
                embed = new EmbedBuilder()
                    .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() })
                    .setTitle(`Degradacja funkcjonariusza`)
                    .setDescription(`Degradacja została nadana przez <@${author.id}>`)
                    .addFields(
                        { name: 'Funkcjonariusz:', value: `<@${target.id}>`, inline: true },
                        { name: 'Poprzedni stopień:', value: currentRank ? currentRank : 'Brak', inline: true },
                        { name: 'Nowy stopień:', value: newRank, inline: true },
                        { name: 'Powód:', value: reason, inline: true },
                        { name: 'Nr odznaki przed:', value: badgeNumberBefore, inline: true },
                        { name: 'Nr odznaki po:', value: badgeNumberAfter, inline: true }
                    )
                    .setFooter({ text: new Date().toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) })
                    .setColor(0xff0000)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1275544141488717884/1275544141790711949/image.png?ex=677ed88d&is=677d870d&hm=35f546225246cc162b81f0b803a8db9387ee69bcd537035adefd4527bc7546bf&');
            }

          
            const promotionChannelId = '1337033901071405126';
            const demotionChannelId = '1337033980947464235'; 
            const targetChannelId = isPromotion ? promotionChannelId : demotionChannelId;
            const channel = client.channels.cache.get(targetChannelId);
            if (!channel) {
                await interaction.editReply({ content: 'Nie masz uprawnień do użycia tej komendy.' });
                return;
            }
           
            await channel.send(`<@${target.id}>`);
            await channel.send({ embeds: [embed] });
            await interaction.editReply({ content: `Funkcjonariusz został zmieniony na stopień ${newRank}.` });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: 'Wystąpił błąd podczas przetwarzania komendy.' });
        }
    }
}).toJSON();
