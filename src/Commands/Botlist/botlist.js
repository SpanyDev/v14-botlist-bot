const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({
    databasePath: "./src/Database/botlist.json"
});

const { botCustom } = require("../../config");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botlist')
        .setDescription("Botlist Ayarlamaları")
        .addSubcommand(subcommand =>
            subcommand
                .setName('yetkili-rol')
                .setDescription('Yetkili Rol Ayarlar')
                .addRoleOption(option =>
                    option.setName('rol')
                        .setDescription('Bir Rol')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('geliştirici-rol')
                .setDescription('Geliştirici Rol Ayarlar')
                .addRoleOption(option =>
                    option.setName('rol')
                        .setDescription('Bir Rol')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('bot-rol')
                .setDescription('Bot Rol Ayarlar')
                .addRoleOption(option =>
                    option.setName('rol')
                        .setDescription('Bir Rol')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ekleme-kanalı')
                .setDescription('Bot Ekleme Kanalını Ayarlar')
                .addChannelOption(option =>
                    option.setName('kanal')
                        .setDescription('Bir Kanal')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('işlem-kanalı')
                .setDescription('Bot Onay-Red Kanalını Ayarlar')
                .addChannelOption(option =>
                    option.setName('kanal')
                        .setDescription('Bir Kanal')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('log-kanalı')
                .setDescription('Bot Log Kanalını Ayarlar')
                .addChannelOption(option =>
                    option.setName('kanal')
                        .setDescription('Bir Kanal')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sahip-log-kanalı')
                .setDescription('Sahip Log Kanalını Ayarlar (Sahibi Çıkan Botları Banlar Ve Logunu Buraya Atar)')
                .addChannelOption(option =>
                    option.setName('kanal')
                        .setDescription('Bir Kanal')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('oto-onay')
                .setDescription('Botu Eklediğinizde Otomatik Olarak Onaylanmasını İstermisin?')
                .addBooleanOption(option =>
                    option.setName('false-true')
                        .setDescription('Oto Onay Sistemi')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sunucu-şart')
                .setDescription('Eklenecek Botun Sunucu Şartlarını Ayarlar')
                .addNumberOption(option =>
                    option.setName('sayı')
                        .setDescription('Eklenecek Botun En Az Bulunması Gereken Sunucu Sayısı')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sistem')
                .setDescription('Botlist Sistemi Açıyor Musun?')
                .addBooleanOption(option =>
                    option.setName('true-false')
                        .setDescription('Botlist Sistemi')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ayarlar')
                .setDescription('Botlist Sisteminin Ayarlarını Gösterir'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    run: async (client, interaction) => {

        const { options } = interaction;
        const subcommand = options.getSubcommand();

        const embed = new EmbedBuilder()
            .setColor(botCustom.color)
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setFooter({ text: `YouTube Spany` })

        if (subcommand === "yetkili-rol") {
            const role = options.getRole("rol");

            const serverRole = interaction.guild.roles.cache.get(role.id);
            if (!serverRole) {
                await interaction.reply({ embeds: [embed.setDescription(`> - Belirtilen rol bu sunucuda bulunmuyor.`)], ephemeral: true });
                return;
            }

            if (serverRole.managed) {
                await interaction.reply({ embeds: [embed.setDescription(`> - Belirtilen rol kullanılamıyor. Belirttiğiniz rol sistem/bot rolü.`)], ephemeral: true });
                return;
            }

            const botMember = interaction.guild.members.cache.get(client.user.id);
            if (botMember.roles.highest.position <= serverRole.position) {
                await interaction.reply({ embeds: [embed.setDescription(`> - Belirttiğiniz rol botun üstünde! Botun rolünü üste taşımanız gereklidir.`)], ephemeral: true });
                return;
            }

            db.set(`botlist.${interaction.guild.id}.yetkiliRol`, role.id);
            embed.setDescription(`> - Botlist yetkili rolü başarıyla **${role.name}** olarak ayarlandı!`);
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "geliştirici-rol") {
            const role = options.getRole("rol");

            const serverRole = interaction.guild.roles.cache.get(role.id);
            if (!serverRole) {
                await interaction.reply({ embeds: [embed.setDescription(`> - Belirtilen rol bu sunucuda bulunmuyor.`)], ephemeral: true });
                return;
            }

            if (serverRole.managed) {
                await interaction.reply({ embeds: [embed.setDescription(`> - Belirtilen rol kullanılamıyor. Belirttiğiniz rol sistem/bot rolü.`)], ephemeral: true });
                return;
            }

            db.set(`botlist.${interaction.guild.id}.developerRole`, role.id);
            embed.setDescription(`> - Botlist geliştirici rolü başarıyla **${role.name}** olarak ayarlandı!`);
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "bot-rol") {
            const role = options.getRole("rol");

            const serverRole = interaction.guild.roles.cache.get(role.id);
            if (!serverRole) {
                await interaction.reply({ embeds: [embed.setDescription(`> - Belirtilen rol bu sunucuda bulunmuyor.`)], ephemeral: true });
                return;
            }

            if (serverRole.managed) {
                await interaction.reply({ embeds: [embed.setDescription(`> - Belirtilen rol kullanılamıyor. Belirttiğiniz rol sistem/bot rolü.`)], ephemeral: true });
                return;
            }

            db.set(`botlist.${interaction.guild.id}.botRole`, role.id);
            embed.setDescription(`> - Botlist bot rolü başarıyla **${role.name}** olarak ayarlandı!`);
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "ekleme-kanalı") {
            const channel = options.getChannel("kanal");

            db.set(`botlist.${interaction.guild.id}.addChannel`, channel.id);
            embed.setDescription(`> - Botlist ekleme kanalı başarıyla **${channel.name}** olarak ayarlandı!`);
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "işlem-kanalı") {
            const channel = options.getChannel("kanal");

            db.set(`botlist.${interaction.guild.id}.processChannel`, channel.id);
            embed.setDescription(`> - Botlist işlem kanalı başarıyla **${channel.name}** olarak ayarlandı!`);
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "log-kanalı") {
            const channel = options.getChannel("kanal");

            db.set(`botlist.${interaction.guild.id}.logChannel`, channel.id);
            embed.setDescription(`> - Botlist log kanalı başarıyla **${channel.name}** olarak ayarlandı!`);
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "sahip-log-kanalı") {
            const channel = options.getChannel("kanal");

            db.set(`botlist.${interaction.guild.id}.ownerLogChannel`, channel.id);
            embed.setDescription(`> - Botlist sahip log kanalı başarıyla **${channel.name}** olarak ayarlandı!`);
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "oto-onay") {
            const boolean = options.getBoolean("false-true");

            db.set(`botlist.${interaction.guild.id}.autoApprove`, boolean);
            embed.setDescription(`> - Botlist oto onay sistemi başarıyla **${boolean ? "aktif" : "deaktif"}** edildi!`);
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "sunucu-şart") {
            const number = options.getNumber("sayı");

            db.set(`botlist.${interaction.guild.id}.guildCount`, number);
            embed.setDescription(`> - Botlist sunucu şartı başarıyla **${number}** olarak ayarlandı!`);
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "sistem") {
            const boolean = options.getBoolean("true-false");

            const addChannel = db.get(`botlist.${interaction.guild.id}.addChannel`)
            const processChannel = db.get(`botlist.${interaction.guild.id}.processChannel`)
            const logChannel = db.get(`botlist.${interaction.guild.id}.logChannel`)
            const ownerLogChannel = db.get(`botlist.${interaction.guild.id}.ownerLogChannel`)
            const yetkiliRol = db.get(`botlist.${interaction.guild.id}.yetkiliRol`)
            const developerRole = db.get(`botlist.${interaction.guild.id}.developerRole`)
            const botRole = db.get(`botlist.${interaction.guild.id}.botRole`)

            if (!addChannel || !processChannel || !logChannel || !ownerLogChannel || !yetkiliRol || !developerRole || !botRole) {
                return interaction.reply({ embeds: [embed.setDescription(`> - Botlist sistemi açılamaz! Eksik ayarlarınızı tamamlayın.`)], ephemeral: true });
            }

            const addButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`${interaction.guild.id}-botAdd`)
                        .setLabel("Bot Ekle")
                        .setStyle(ButtonStyle.Primary)
                )

            const botAddEmbed = new EmbedBuilder()
                .setColor(botCustom.color)
                .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
                .setFooter({ text: `YouTube Spany` })
                .setFields(
                    { name: "Bot Ekleme Kuralları", value: `> - Discord botunuz discord tos kurallarına uymalı.\n> - Yasaklı komutlar bulunmamalı.` },
                )
            db.set(`botlist.${interaction.guild.id}.system`, boolean);
            embed.setDescription(`> - Botlist sistemi başarıyla **${boolean ? "aktif" : "deaktif"}** edildi!`);
            client.channels.cache.get(addChannel).send({ embeds: [botAddEmbed], components: [addButton] });
            return interaction.reply({ embeds: [embed] });
        }

        if (subcommand === "ayarlar") {
            const system = db.get(`botlist.${interaction.guild.id}.system`);
            const autoApprove = db.get(`botlist.${interaction.guild.id}.autoApprove`);
            const guildCount = db.get(`botlist.${interaction.guild.id}.guildCount`);
            const addChannel = db.get(`botlist.${interaction.guild.id}.addChannel`);
            const processChannel = db.get(`botlist.${interaction.guild.id}.processChannel`);
            const logChannel = db.get(`botlist.${interaction.guild.id}.logChannel`);
            const ownerLogChannel = db.get(`botlist.${interaction.guild.id}.ownerLogChannel`);
            const yetkiliRol = db.get(`botlist.${interaction.guild.id}.yetkiliRol`);
            const developerRole = db.get(`botlist.${interaction.guild.id}.developerRole`);
            const botRole = db.get(`botlist.${interaction.guild.id}.botRole`);

            embed.setDescription(`
            > - Botlist Sistemi: **${system ? "Aktif" : "Deaktif"}**
            > - Botu Eklediğinizde Otomatik Olarak Onaylanmasını İstermisin?: **${autoApprove ? "Evet" : "Hayır"}**
            > - Eklenecek Botun Sunucu Şartı: **${guildCount ? `${guildCount}` : "0"}**
            > - Bot Ekleme Kanalı: **${addChannel ? `<#${addChannel}>` : "Belirtilmemiş"}**
            > - Bot Onay-Red Kanalı: **${processChannel ? `<#${processChannel}>` : "Belirtilmemiş"}**
            > - Bot Log Kanalı: **${logChannel ? `<#${logChannel}>` : "Belirtilmemiş"}**
            > - Sahip Log Kanalı: **${ownerLogChannel ? `<#${ownerLogChannel}>` : "Belirtilmemiş"}**
            > - Yetkili Rol: **${yetkiliRol ? `<@&${yetkiliRol}>` : "Belirtilmemiş"}**
            > - Geliştirici Rol: **${developerRole ? `<@&${developerRole}>` : "Belirtilmemiş"}**
            > - Bot Rol: **${botRole ? `<@&${botRole}>` : "Belirtilmemiş"}**
            `);

            return interaction.reply({ embeds: [embed] });
        }
    }
};
