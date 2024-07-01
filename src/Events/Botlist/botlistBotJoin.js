const { Colors, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle } = require("discord.js")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({
    databasePath: "./src/Database/botlist.json"
});
const fetch = require('node-fetch');
const config = require('../../config')

module.exports = {
    name: "guildMemberAdd",
    run: async (client, member) => {
        if (!member.user.bot) return;

        const system = db.get(`botlist.${member.guild.id}.system`)
        if (!system) return;

        const logChannel = member.guild.channels.cache.get(db.get(`botlist.${member.guild.id}.logChannel`))

        const ownerLogChannel = member.guild.channels.cache.get(db.get(`botlist.${member.guild.id}.ownerLogChannel`))
        const yetkiliRol = member.guild.roles.cache.get(db.get(`botlist.${member.guild.id}.yetkiliRol`))
        const developerRole = member.guild.roles.cache.get(db.get(`botlist.${member.guild.id}.developerRole`))
        const botRole = member.guild.roles.cache.get(db.get(`botlist.${member.guild.id}.botRole`))

        if (!logChannel || !ownerLogChannel || !yetkiliRol || !developerRole || !botRole) return;

        const botsData = db.get(`botlist.${member.guild.id}.botsData`)
        if (!botsData) return;

        const bot = botsData[member.id]
        if (!bot) return;

        if (bot.status === "Approved") {
            const owner = member.guild.members.cache.get(bot.owner)
            if (!owner) return;

            const botMember = member.guild.members.cache.get(member.id)
            if (!botMember) return;

            botMember.roles.add(botRole).catch(() => { })
            owner.roles.add(developerRole).catch(() => { })
        } else {
            const autoApprove = db.get(`botlist.${member.guild.id}.autoApprove`)
            if (autoApprove) {
                const botId = member.id

                const logMessageId = db.get(`botlist.${member.guild.id}.botsData.${botId}.logMessageId`)

                const dcBot = await client.users.fetch(botId)

                const onayEmbed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setAuthor({
                        name: member.user.tag,
                        iconURL: member.user.avatarURL({ dynamic: true, size: 4096 })
                    })
                    .setTitle("Bir Bot Otomatik Onaylandı!")
                    .setThumbnail(dcBot.displayAvatarURL({ dynamic: true, size: 4096 }))
                    .setFields(
                        { name: "Bot Adı", value: `${dcBot.tag}`, inline: true },
                        { name: "Bot ID", value: `${botId}`, inline: true },
                    )

                const apprevedChannel = db.get(`botlist.${member.guild.id}.processChannel`)

                client.channels.cache.get(apprevedChannel).send({ embeds: [onayEmbed] })
                db.set(`botlist.${member.guild.id}.botsData.${botId}.status`, "Approved")

                const bot = botsData[member.id]
                if (!bot) return;

                const owner = member.guild.members.cache.get(bot.owner)
                if (!owner) return;
    
                const botMember = member.guild.members.cache.get(member.id)
                if (!botMember) return;

                botMember.roles.add(botRole).catch(() => { })
                owner.roles.add(developerRole).catch(() => { })

                logChannel.messages.fetch(logMessageId).then(msg => {
                    msg.delete().catch(() => { })
                })
            }
        }

    }
}
