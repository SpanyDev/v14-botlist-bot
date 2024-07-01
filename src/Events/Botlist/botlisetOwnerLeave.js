const { Colors, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle } = require("discord.js")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({
    databasePath: "./src/Database/botlist.json"
});
const fetch = require('node-fetch');
const config = require('../../config')

module.exports = {
    name: "guildMemberRemove",
    run: async (client, member) => {
        if (member.user.bot) return;

        const system = db.get(`botlist.${member.guild.id}.system`)
        if (!system) return;

        const ownerLogChannel = member.guild.channels.cache.get(db.get(`botlist.${member.guild.id}.ownerLogChannel`))
        if (!ownerLogChannel) return;

        const botsData = db.get(`botlist.${member.guild.id}.botsData`)
        if (!botsData) return;

        const botOwner = Object.values(botsData).find(x => x.owner === member.id)
        if (!botOwner) return;

        const bot = Object.keys(botsData).find(x => botsData[x].owner === member.id)

        const embed = new EmbedBuilder()
            .setColor(config.botCustom.color)
            .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.avatarURL()})
            .setFooter({ text: `YouTube Spany` })

        if (member.id === botOwner.owner) {
            ownerLogChannel.send({ embeds: [embed.setDescription(`**${member}** adlı kullanıcı sunucudan ayrıldı ve botu sunucudan atıldı!`).setColor(config.botCustom.redColor)] })
            member.guild.members.kick(bot, { reason: "Botun sahibi sunucudan ayrıldığı için bot sunucudan atıldı!" })
            db.delete(`botlist.${member.guild.id}.botsData.${bot}`)
        }
    }
}
