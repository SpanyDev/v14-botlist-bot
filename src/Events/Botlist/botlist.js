const { Colors, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle } = require("discord.js")
const { JsonDatabase } = require("wio.db")
const db = new JsonDatabase({
    databasePath: "./src/Database/botlist.json"
});
const fetch = require('node-fetch');
const config = require('../../config')

module.exports = {
    name: "interactionCreate",
    run: async (client, interaction) => {

        const embed = new EmbedBuilder()
            .setColor(config.botCustom.color)
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setFooter({ text: `YouTube Spany` })

        if (interaction.isButton()) {
            if (interaction.customId === `${interaction.guild.id}-botAdd`) {
                const addChannel = interaction.guild.channels.cache.get(db.get(`botlist.${interaction.guild.id}.addChannel`))
                const processChannel = interaction.guild.channels.cache.get(db.get(`botlist.${interaction.guild.id}.processChannel`))
                const logChannel = interaction.guild.channels.cache.get(db.get(`botlist.${interaction.guild.id}.logChannel`))
                const ownerLogChannel = interaction.guild.channels.cache.get(db.get(`botlist.${interaction.guild.id}.ownerLogChannel`))
                const yetkiliRol = interaction.guild.roles.cache.get(db.get(`botlist.${interaction.guild.id}.yetkiliRol`))
                const developerRole = interaction.guild.roles.cache.get(db.get(`botlist.${interaction.guild.id}.developerRole`))
                const botRole = interaction.guild.roles.cache.get(db.get(`botlist.${interaction.guild.id}.botRole`))

                if (!addChannel || !processChannel || !logChannel || !ownerLogChannel || !yetkiliRol || !developerRole || !botRole) {
                    return interaction.reply({ embeds: [embed.setDescription(`> - Botlist sistemi eksik ayarlanmış lütfen yetkililere bildirin.`)], ephemeral: true });
                }

                const modal = new ModalBuilder()
                    .setCustomId(`${interaction.guild.id}-botAddModal`)
                    .setTitle("Bot Ekleme")

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('botId')
                            .setLabel("Botun ID'sini girin.")
                            .setStyle(TextInputStyle.Short)
                    )
                )
                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('botPrefix')
                            .setLabel("Botun Prefix'ini girin.")
                            .setStyle(TextInputStyle.Short)
                    )
                )

                await interaction.showModal(modal)
            }

            if (interaction.customId.startsWith("botOnayla")) {
                const botId = interaction.customId.split("-")[2]

                const staffRole = interaction.guild.roles.cache.get(db.get(`botlist.${interaction.guild.id}.yetkiliRol`))
                if (!interaction.member.roles.cache.has(staffRole.id)) return interaction.reply({ embeds: [embed.setDescription(`> - Bu işlemi yapabilmek için <@&${staffRole.id}> rolüne sahip olmalısınız.`)], ephemeral: true });

                const bot = db.get(`botlist.${interaction.guild.id}.botsData.${botId}`)
                if (!bot) return interaction.reply({ embeds: [embed.setDescription(`> - Bu bot zaten eklenmemiş.`)], ephemeral: true });

                const dcBot = await client.users.fetch(botId)

                const onayEmbed = new EmbedBuilder()
                    .setColor(Colors.Green)
                    .setAuthor({
                        name: interaction.user.tag,
                        iconURL: interaction.user.avatarURL({ dynamic: true, size: 4096 })
                    })
                    .setTitle("Bir Bot Onaylandı!")
                    .setThumbnail(dcBot.displayAvatarURL({ dynamic: true, size: 4096 }))
                    .setFields(
                        { name: "Bot Adı", value: `${dcBot.tag}`, inline: true },
                        { name: "Bot ID", value: `${botId}`, inline: true },
                        { name: "Bot Prefix", value: `${bot.prefix}`, inline: true },
                    )
                
                db.set(`botlist.${interaction.guild.id}.botsData.${botId}.status`, "Approved")
                db.substr(`botlist.${interaction.guild.id}.waitSize`, 1)

                await interaction.reply({ content: `Bot Onaylandı`, ephemeral: true })
                client.channels.cache.get(db.get(`botlist.${interaction.guild.id}.processChannel`)).send({ embeds: [onayEmbed] })
                interaction.message.delete()
            }

            if (interaction.customId.startsWith("botReddet")) {
                const botId = interaction.customId.split("-")[2]
                const staffRole = interaction.guild.roles.cache.get(db.get(`botlist.${interaction.guild.id}.yetkiliRol`))
                if (!interaction.member.roles.cache.has(staffRole.id)) return interaction.reply({ embeds: [embed.setDescription(`> - Bu işlemi yapabilmek için <@&${staffRole.id}> rolüne sahip olmalısınız.`)], ephemeral: true });

                try {
                    const modal = new ModalBuilder()
                        .setCustomId(`botRed-${botId}-reason`)
                        .setTitle("Bot Reddetme Sebebi")

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('reason')
                                .setLabel("Botu neden reddettiniz?")
                                .setStyle(TextInputStyle.Paragraph)
                                .setMaxLength(124)
                        )
                    )

                    await interaction.showModal(modal)
                } catch (error) {
                    console.log(error)
                }
            }
        }

        if (interaction.isModalSubmit()) {
            try {
                if (interaction.customId === `${interaction.guild.id}-botAddModal`) {
                    const addChannel = interaction.guild.channels.cache.get(db.get(`botlist.${interaction.guild.id}.addChannel`))
                    const processChannel = interaction.guild.channels.cache.get(db.get(`botlist.${interaction.guild.id}.processChannel`))
                    const logChannel = interaction.guild.channels.cache.get(db.get(`botlist.${interaction.guild.id}.logChannel`))
                    const ownerLogChannel = interaction.guild.channels.cache.get(db.get(`botlist.${interaction.guild.id}.ownerLogChannel`))
                    const yetkiliRol = interaction.guild.roles.cache.get(db.get(`botlist.${interaction.guild.id}.yetkiliRol`))
                    const developerRole = interaction.guild.roles.cache.get(db.get(`botlist.${interaction.guild.id}.developerRole`))
                    const botRole = interaction.guild.roles.cache.get(db.get(`botlist.${interaction.guild.id}.botRole`))
                    const guildCount = db.get(`botlist.${interaction.guild.id}.guildCount`) || 0

                    if (!addChannel || !processChannel || !logChannel || !ownerLogChannel || !yetkiliRol || !developerRole || !botRole) {
                        return interaction.reply({ embeds: [embed.setDescription(`> - Botlist sistemi eksik ayarlanmış lütfen yetkililere bildirin.`)], ephemeral: true });
                    }

                    const botId = interaction.fields.getTextInputValue('botId');
                    const botPrefix = interaction.fields.getTextInputValue('botPrefix');

                    if (isNaN(botId)) return interaction.reply({ embeds: [embed.setDescription("> Botun ID'sini doğru girmeniz gerekiyor.")], ephemeral: true });

                    let response = await fetch(`https://discord.com/api/v8/oauth2/authorize?client_id=${botId}&scope=bot`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `${config.selfToken}`
                        }
                    })

                    let body = await response.json();
                    if (body.code === 10002) return interaction.reply({ embeds: [embed.setDescription(`> - Bu bot discordda bulunmuyor.`)], ephemeral: true });

                    let sunucu = body.bot.approximate_guild_count;
                    let bot_public = body.application.bot_public;


                    if (bot_public === undefined) {
                        return interaction.reply({ embeds: [embed.setDescription(`> - Discord botunuz herkese açık olması gerekiyor.`)], ephemeral: true });
                    }

                    if (guildCount) {
                        if (body.bot.approximate_guild_count < guildCount) {
                            return interaction.reply({ embeds: [embed.setDescription(`> - Botunuzun sunucu sayısı ${guildCount} üstünde olmalıdır.`)], ephemeral: true });
                        }
                    }

                    let dcBot = null;
                    try {
                        dcBot = await client.users.fetch(botId)
                    } catch {
                        return interaction.reply({ embeds: [embed.setDescription(`> - Kullanıcılarımda böyle bir botu bulamadım.`)], ephemeral: true });
                    }

                    if (!client.users.cache.get(botId)) {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Link)
                                    .setLabel("Botu Ekle")
                                    .setURL(`https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=0`)
                            )

                        const embed = new EmbedBuilder()
                            .setColor(config.botCustom.color)
                            .setAuthor({
                                name: `Botu Ekleyen Kişi ${interaction.user.tag}`,
                                iconURL: interaction.user.avatarURL({ size: 1024, dynamic: true }),
                                url: `https://discord.com/users/${interaction.user.id}`
                            })
                            .setThumbnail(interaction.guild.iconURL({ size: 1024, dynamic: true }))
                            .setTitle("`Biri Bot Eklemek İstedi!`")
                            .setDescription(`
            > **__Fakat botun bilgilerine erişemedim;__**
            **▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬**
            > 
            > **\`Botun Sahibi\` >> ${interaction.user}|${interaction.user.tag}**
            > 
            > **\`Bot ID'si\` >> ${botId}**
            > 
            **▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬**
            `)

                        client.channels.cache.get(logChannel).send({ embeds: [embed], components: [row] })
                    } else {
                        if (!dcBot.bot) return interaction.reply({ embeds: [embed.setDescription(`> - Bir Bot ID'si girmelisiniz.`)], ephemeral: true });
                        let bot = db.get(`botlist.${interaction.guild.id}.botsData.${botId}`);
                        if (bot) return interaction.reply({ embeds: [embed.setDescription(`> - Bu bot zaten eklenmiş.`)], ephemeral: true });

                        const date = new Date();
                        const timestamp = Math.floor(date / 1000);
                        db.add(`botlist.${interaction.guild.id}.waitSize`, 1)
                        db.set(`botlist.${interaction.guild.id}.botsData.${botId}.id`, botId)
                        db.set(`botlist.${interaction.guild.id}.botsData.${botId}.prefix`, botPrefix)
                        db.set(`botlist.${interaction.guild.id}.botsData.${botId}.owner`, interaction.user.id)
                        db.set(`botlist.${interaction.guild.id}.botsData.${botId}.status`, "Waiting")
                        db.set(`botlist.${interaction.guild.id}.botsData.${botId}.timestamp`, timestamp)

                        let sira = db.fetch(`botlist.${interaction.guildId}.waitSize`) || 0;

                        const rowİslem = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Link)
                                    .setLabel("Botu Ekle")
                                    .setURL(`https://discord.com/oauth2/authorize?client_id=${botId}&scope=bot&permissions=0`),
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Danger)
                                    .setLabel("Botu Reddet")
                                    .setCustomId(`botReddet-${interaction.guild.id}-${dcBot.id}`),
                                new ButtonBuilder()
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel("Botu Onayla")
                                    .setCustomId(`botOnayla-${interaction.guild.id}-${dcBot.id}`)
                            )

                        const addBotEmbed = new EmbedBuilder()
                            .setColor(config.botCustom.color)
                            .setAuthor({
                                name: interaction.user.tag,
                                iconURL: interaction.user.avatarURL({ dynamic: true, size: 4096 })
                            })
                            .setTitle("Bir Bot Eklendi!")
                            .setThumbnail(dcBot.displayAvatarURL({ dynamic: true, size: 4096 }))
                            .setFields(
                                { name: "Bot Adı", value: `${dcBot.tag}`, inline: true },
                                { name: "Bot ID", value: `${botId}`, inline: true },
                                { name: "Bot Prefix", value: `${botPrefix}`, inline: true },
                                { name: "Bot Sahibi", value: `${interaction.user.tag}`, inline: true },
                                { name: "Bot Sırası", value: `${sira}`, inline: true },
                                { name: "Sunucu Sayısı", value: `${sunucu}`, inline: true },
                                { name: "Botun Kullanım Şartları", value: `\`\`\`${body.application.terms_of_service_url || "Bulunamadı"}\`\`\`` },
                                { name: "Botun Gizlilik Politikası", value: `\`\`\`${body.application.privacy_policy_url || "Bulunamadı"}\`\`\`` },
                                { name: "Bot Etiketleri", value: `\`\`\`${body.application.tags || "Bulunamadı"}\`\`\``, inline: true },
                            )

                        await interaction.reply({ content: `Botunuz Sisteme Eklendi`, ephemeral: true })
                        client.channels.cache.get(db.get(`botlist.${interaction.guild.id}.logChannel`)).send({ components: [rowİslem], content: `<@&${db.get(`botlist.${interaction.guild.id}.yetkiliRol`)}>`, embeds: [addBotEmbed] })
                        .then(async (msg) => {
                            db.set(`botlist.${interaction.guild.id}.botsData.${botId}.logMessageId`, msg.id)
                        })
                    }
                }

                if (interaction.customId.startsWith("botRed")) {
                    const botId = interaction.customId.split("-")[1]
                    const guildId = interaction.guild.id
                    const reason = interaction.fields.getTextInputValue('reason');

                    const bot = db.get(`botlist.${interaction.guild.id}.botsData.${botId}`)

                    if (!bot) return interaction.reply({ embeds: [embed.setDescription(`> - Bu bot zaten eklenmemiş.`)], ephemeral: true });

                    const dcBot = await client.users.fetch(botId)

                    const redEmbed = new EmbedBuilder()
                        .setColor(Colors.Red)
                        .setAuthor({
                            name: interaction.user.tag,
                            iconURL: interaction.user.avatarURL({ dynamic: true, size: 4096 })
                        })
                        .setTitle("Bir Bot Reddedildi!")
                        .setThumbnail(dcBot.displayAvatarURL({ dynamic: true, size: 4096 }))
                        .setFields(
                            { name: "Bot Adı", value: `${dcBot.tag}`, inline: true },
                            { name: "Bot ID", value: `${botId}`, inline: true },
                            { name: "Bot Prefix", value: `${bot.prefix}`, inline: true },
                            { name: "Reddedilme Nedeni", value: `\`\`\`${reason}\`\`\``, inline: true }
                        )

                    db.delete(`botlist.${interaction.guild.id}.botsData.${botId}`)
                    db.substr(`botlist.${interaction.guild.id}.waitSize`, 1)

                    await interaction.reply({ content: `Bot Reddedildi`, ephemeral: true })
                    client.channels.cache.get(db.get(`botlist.${interaction.guild.id}.processChannel`)).send({ embeds: [redEmbed] })
                    interaction.message.delete()
                }
            } catch (error) {
                console.log(error)
            }
        }

    }
}
