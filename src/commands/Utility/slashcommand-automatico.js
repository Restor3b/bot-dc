const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

async function removeRoles(client) {
    const guildId = '1259796857211588689';
    const userIds = ['899068875755360286', 'USER_ID_2'];
    const roleIdsToRemove = ['1259796857291411558', 'ROLE_ID_2'];

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    for (const userId of userIds) {
        try {
            const member = await guild.members.fetch(userId);
            if (!member) continue;

            for (const roleId of roleIdsToRemove) {
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    console.log(`Usunięto rolę ${roleId} u użytkownika ${userId}`);
                }
            }
        } catch (err) {
            console.error(`Błąd przy użytkowniku ${userId}:`, err);
        }
    }

    console.log(`Wszystkie role zostały przetworzone.`);
}



