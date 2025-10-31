import { 
    Events, 
    Interaction, 
    Collection,
    ChatInputCommandInteraction,
    ButtonInteraction,
    ModalSubmitInteraction,
    ChannelType,
    PermissionFlagsBits,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    TextChannel,
    Message,
    MessageFlags
} from 'discord.js';
import axios from 'axios';
import { botConfig } from '../utils/config.js';
import { createErrorEmbed, createSuccessEmbed, createInfoEmbed } from '../utils/embeds.js';
import { captchaManager } from '../utils/captchaManager.js';
import type { BotEvent, ExtendedClient } from '../types/index.js';

const event: BotEvent = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        // Gestion des commandes slash
        if (interaction.isChatInputCommand()) {
            await handleSlashCommand(interaction);
        }
        
        // Gestion des boutons
        if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
        }
        
        // Gestion des modals
        if (interaction.isModalSubmit()) {
            await handleModalSubmit(interaction);
        }
    }
};

async function handleSlashCommand(interaction: any): Promise<void> {
    const client = interaction.client as any;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        await interaction.reply({
            embeds: [createErrorEmbed('Error', 'This command does not exist!')],
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    // Gestion du cooldown
    const { cooldowns } = client;
    
    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name)!;
    const cooldownAmount = (command.cooldown ?? 3) * 1000;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return await interaction.reply({
                embeds: [createErrorEmbed(
                    'Cooldown',
                    `Please wait ${timeLeft.toFixed(1)} seconds before using this command again.`
                )],
                flags: MessageFlags.Ephemeral
            });
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    // Execute command
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing command:', error);
        
        const errorEmbed = createErrorEmbed(
            'Error',
            'An error occurred while executing this command.'
        );

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        }
    }
}

async function handleButtonInteraction(interaction: ButtonInteraction) {
    const { customId } = interaction;

    try {
        switch (customId) {
            case 'create_ticket':
                await handleCreateTicket(interaction);
                break;
            
            case 'ticket_technical':
                await handleCreateTicketModal(interaction, 'Technical Support', '🔧');
                break;
                
            case 'ticket_general':
                await handleCreateTicketModal(interaction, 'General Help', '❓');
                break;
                
            case 'ticket_suggestion':
                await handleCreateTicketModal(interaction, 'Suggestions', '📝');
                break;
                
            case 'ticket_report':
                await handleCreateTicketModal(interaction, 'Report Issues', '🚨');
                break;
                
            case 'ticket_partner':
                await handleCreateTicketModal(interaction, 'Partner Request', '👥');
                break;
                
            case 'ticket_other':
                await handleCreateTicketModal(interaction, 'Other', '💼');
                break;
            
            case 'server_rules':
                await handleServerRules(interaction);
                break;
                
            case 'get_roles':
                await handleGetRoles(interaction);
                break;
                
            case 'ticket_close':
                await handleTicketClose(interaction);
                break;
                
            default:
                // Handle CAPTCHA buttons
                if (customId.startsWith('captcha_input_')) {
                    await handleCaptchaInput(interaction);
                } else if (customId.startsWith('ticket_')) {
                    await handleTicketAction(interaction);
                }
                break;
        }
        } catch (error) {
        console.error('Error processing button:', error);
        
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                embeds: [createErrorEmbed('Error', 'An error occurred.')],
                flags: MessageFlags.Ephemeral
            });
        }
    }
}

async function handleCreateTicket(interaction: ButtonInteraction) {
    const modal = new ModalBuilder()
        .setCustomId('ticket_modal')
        .setTitle('Create a Ticket');

    const typeInput = new TextInputBuilder()
        .setCustomId('ticket_type')
        .setLabel('Request Type')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('support, bug, suggestion, other...')
        .setRequired(true)
        .setMaxLength(50);

    const reasonInput = new TextInputBuilder()
        .setCustomId('ticket_reason')
        .setLabel('Detailed Reason')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Describe your problem or request in detail...')
        .setRequired(true)
        .setMaxLength(1000);

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(typeInput);
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
}

async function handleCreateTicketModal(interaction: ButtonInteraction, ticketType: string, emoji: string) {
    // Create a modal for the specific ticket type
    const modal = new ModalBuilder()
        .setCustomId(`ticket_modal_${ticketType.toLowerCase().replace(/\s+/g, '_')}`)
        .setTitle(`${emoji} ${ticketType} Ticket`);

    const reasonInput = new TextInputBuilder()
        .setCustomId('ticket_reason')
        .setLabel('Describe your request')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder(`Please describe your ${ticketType.toLowerCase()} request in detail...`)
        .setRequired(true)
        .setMaxLength(1000);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}

async function handleServerRules(interaction: ButtonInteraction) {
    const rulesEmbed = createInfoEmbed(
        'DevHub Server Rules',
        `📋 **Main Rules:**

        1️⃣ **Mutual respect** - Be respectful to all members
        2️⃣ **No spam** - Avoid repetitive messages
        3️⃣ **Appropriate content** - Keep content suitable for everyone
        4️⃣ **Appropriate channels** - Use the right channels for your discussions
        5️⃣ **No advertising** - No unauthorized promotion
        6️⃣ **Constructive help** - Help other members when possible
        
        **Sanctions:** Warning → Mute → Kick → Ban
        
        For more details, check <#rules-channel>`
    );

    await interaction.reply({ embeds: [rulesEmbed], flags: MessageFlags.Ephemeral });
}

async function handleGetRoles(interaction: ButtonInteraction) {
    // Here you can implement a self-assignable roles system
    const rolesEmbed = createInfoEmbed(
        'Available Roles',
        `🎭 **Roles you can get:**
        
        • **Frontend** - Frontend development
        • **Backend** - Backend development
        • **Mobile** - Mobile development
        • **DevOps** - Infrastructure and deployment
        • **Design** - UI/UX Design
        • **Data** - Data Science / Analytics
        
        Contact a moderator to get your roles!`
    );

    await interaction.reply({ embeds: [rolesEmbed], flags: MessageFlags.Ephemeral });
}

async function handleTicketAction(interaction: ButtonInteraction) {
    // Will handle ticket actions (close, claim, etc.)
    // Implementation in the next ticket system
}

async function handleModalSubmit(interaction: ModalSubmitInteraction) {
    if (interaction.customId === 'ticket_modal') {
        await handleTicketCreation(interaction);
    } else if (interaction.customId.startsWith('ticket_modal_')) {
        await handleNewTicketCreation(interaction);
    } else if (interaction.customId.startsWith('captcha_modal_')) {
        await handleCaptchaModal(interaction);
    }
}

async function handleNewTicketCreation(interaction: ModalSubmitInteraction): Promise<void> {
    try {
        const reason = interaction.fields.getTextInputValue('ticket_reason');
        
        // Extract ticket type from modal ID
        const ticketType = interaction.customId.replace('ticket_modal_', '').replace(/_/g, ' ');
        const ticketTypeCapitalized = ticketType.charAt(0).toUpperCase() + ticketType.slice(1);
        
        const guild = interaction.guild!;
        const user = interaction.user;
        
        // Check if user already has an open ticket
        const existingTicket = guild.channels.cache.find(
            channel => channel.name === `ticket-${user.username.toLowerCase()}` && channel.type === ChannelType.GuildText
        );

        if (existingTicket) {
            await interaction.reply({
                embeds: [createErrorEmbed(
                    'Ticket Already Exists',
                    `You already have an open ticket: ${existingTicket}`
                )],
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Create ticket channel
        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username.toLowerCase()}`,
            type: ChannelType.GuildText,
            parent: botConfig.ticketCategoryId,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    id: botConfig.staffRoleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.ManageMessages
                    ]
                }
            ]
        });

        // Create ticket embed
        const ticketEmbed = new EmbedBuilder()
            .setTitle(`🎫 ${ticketTypeCapitalized} Ticket`)
            .setDescription(`**User:** ${user}\n**Type:** ${ticketTypeCapitalized}\n**Reason:**\n${reason}`)
            .setColor(0x5865F2)
            .setFooter({ text: 'DevHub Support Ticket' })
            .setTimestamp();

        // Create ticket control buttons
        const ticketActions = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

        await ticketChannel.send({
            content: `${user} Your ticket has been created! A staff member will assist you soon.\n<@&${botConfig.staffRoleId}>`,
            embeds: [ticketEmbed],
            components: [ticketActions]
        });

        await interaction.reply({
            embeds: [createSuccessEmbed(
                'Ticket Created',
                `Your ${ticketTypeCapitalized.toLowerCase()} ticket has been created: ${ticketChannel}`
            )],
            flags: MessageFlags.Ephemeral
        });

    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.reply({
            embeds: [createErrorEmbed('Error', 'Failed to create ticket. Please try again.')],
            flags: MessageFlags.Ephemeral
        });
    }
}

async function handleTicketClose(interaction: ButtonInteraction): Promise<void> {
    try {
        const channel = interaction.channel as TextChannel;
        if (!channel || !channel.name || !channel.name.startsWith('ticket-')) {
            await interaction.reply({
                embeds: [createErrorEmbed('Error', 'This is not a valid ticket channel.')],
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Check if user has permission to close tickets
        const member = interaction.member as any;
        if (!member || (!(member.permissions as any).has(PermissionFlagsBits.ManageChannels) && !channel.name.includes(interaction.user.username.toLowerCase()))) {
            await interaction.reply({
                embeds: [createErrorEmbed('Error', 'You do not have permission to close this ticket.')],
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Extract username from channel name
        const ticketOwnerUsername = channel.name.replace('ticket-', '').split('-')[0];
        const ticketOwner = interaction.guild?.members.cache.find(m => 
            m.user.username.toLowerCase() === ticketOwnerUsername.toLowerCase()
        );

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle('🔄 Closing Ticket')
                .setDescription('Generating transcript and closing ticket...')
                .setColor(0xFEE75C)]
        });

        // Generate transcript
        const transcript = await generateTranscript(channel);
        let hastebinUrl = '';

        try {
            // Use paste.ee (free, no API key required)
            console.log('📄 Uploading transcript to paste.ee...');
            const response = await axios.post('https://api.paste.ee/v1/pastes', {
                description: `Ticket Transcript - ${channel.name}`,
                sections: [
                    {
                        name: 'transcript.txt',
                        syntax: 'text',
                        contents: transcript
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });
            
            if (response.data && response.data.link) {
                hastebinUrl = response.data.link;
                console.log('✅ Transcript uploaded successfully:', hastebinUrl);
            } else {
                throw new Error('Invalid response from paste.ee');
            }
        } catch (error) {
            console.error('❌ Error uploading to paste.ee:', error);
            
            // Try dpaste as fallback
            try {
                console.log('🔄 Trying fallback service (dpaste)...');
                const formData = new URLSearchParams();
                formData.append('content', transcript);
                formData.append('syntax', 'text');
                formData.append('expiry_days', '7');
                
                const dpastResponse = await axios.post('https://dpaste.com/api/', formData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    timeout: 10000
                });
                
                hastebinUrl = dpastResponse.data.trim();
                console.log('✅ Transcript uploaded to dpaste:', hastebinUrl);
            } catch (dpastError) {
                console.error('❌ All services failed:', dpastError);
                
                // Last resort: save transcript in embed description (truncated)
                const shortTranscript = transcript.length > 1000 
                    ? transcript.substring(0, 1000) + '...\n\n[Transcript truncated due to length]'
                    : transcript;
                    
                hastebinUrl = `Transcript:\n\`\`\`\n${shortTranscript}\n\`\`\``;
                console.log('⚠️ Using inline transcript as fallback');
            }
        }

        // Send DM to ticket owner
        if (ticketOwner) {
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('🎫 Ticket Closed - DevHub Support')
                    .setDescription('Thank you for contacting DevHub support! Your ticket has been closed.')
                    .addFields([
                        {
                            name: '📋 Ticket Information',
                            value: `**Channel:** ${channel.name}\n**Closed by:** ${interaction.user.tag}\n**Server:** ${interaction.guild?.name}`,
                            inline: false
                        },
                        {
                            name: '📄 Transcript',
                            value: hastebinUrl !== 'Failed to generate transcript link' 
                                ? `[View Full Conversation](${hastebinUrl})`
                                : 'Transcript generation failed',
                            inline: false
                        },
                        {
                            name: '💬 Need More Help?',
                            value: 'Feel free to create a new ticket anytime if you need further assistance!',
                            inline: false
                        }
                    ])
                    .setColor(0x57F287)
                    .setFooter({ 
                        text: 'DevHub Support Team',
                        iconURL: interaction.guild?.iconURL() || undefined
                    })
                    .setTimestamp();

                await ticketOwner.send({ embeds: [dmEmbed] });
                console.log(`✅ DM sent to ${ticketOwner.user.tag} with transcript`);
            } catch (dmError) {
                console.log(`⚠️ Could not send DM to ${ticketOwner.user.tag}: ${dmError}`);
            }
        }

        // Update channel with closure info
        const closeEmbed = new EmbedBuilder()
            .setTitle('🔒 Ticket Closed')
            .setDescription(`This ticket has been closed by ${interaction.user}`)
            .addFields([
                {
                    name: '📄 Transcript',
                    value: hastebinUrl !== 'Failed to generate transcript link' 
                        ? `[View Transcript](${hastebinUrl})`
                        : 'Transcript generation failed',
                    inline: false
                }
            ])
            .setColor(0xED4245)
            .setTimestamp();

        await interaction.editReply({ embeds: [closeEmbed] });

        // Delete the channel after 10 seconds
        setTimeout(async () => {
            try {
                await channel.delete();
            } catch (error) {
                console.error('Error deleting ticket channel:', error);
            }
        }, 10000);

    } catch (error) {
        console.error('Error closing ticket:', error);
        if (!interaction.replied) {
            await interaction.reply({
                embeds: [createErrorEmbed('Error', 'Failed to close ticket.')],
                flags: MessageFlags.Ephemeral
            });
        }
    }
}

async function generateTranscript(channel: TextChannel): Promise<string> {
    try {
        const messages = await channel.messages.fetch({ limit: 100 });
        const sortedMessages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        
        let transcript = `=== TICKET TRANSCRIPT ===\n`;
        transcript += `Channel: ${channel.name}\n`;
        transcript += `Created: ${channel.createdAt?.toISOString()}\n`;
        transcript += `Closed: ${new Date().toISOString()}\n`;
        transcript += `=========================\n\n`;

        for (const message of sortedMessages.values()) {
            const timestamp = message.createdAt.toISOString();
            const author = message.author.tag;
            const content = message.content || '[No content]';
            
            transcript += `[${timestamp}] ${author}: ${content}\n`;
            
            // Add embeds info
            if (message.embeds.length > 0) {
                transcript += `  └─ [EMBED] ${message.embeds[0].title || 'Embed'}\n`;
            }
            
            // Add attachments info
            if (message.attachments.size > 0) {
                message.attachments.forEach(attachment => {
                    transcript += `  └─ [ATTACHMENT] ${attachment.name} (${attachment.url})\n`;
                });
            }
        }

        return transcript;
    } catch (error) {
        console.error('Error generating transcript:', error);
        return 'Error: Could not generate transcript';
    }
}

async function handleTicketCreation(interaction: any): Promise<void> {
    const type = interaction.fields.getTextInputValue('ticket_type');
    const reason = interaction.fields.getTextInputValue('ticket_reason');

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
        // Check if user already has an open ticket
        const existingTicket = interaction.guild?.channels.cache.find((channel: any) => 
            channel.name === `ticket-${interaction.user.username.toLowerCase()}` && 
            channel.type === ChannelType.GuildText
        );

        if (existingTicket) {
            await interaction.editReply({
                embeds: [createErrorEmbed(
                    'Existing Ticket',
                    `You already have an open ticket: ${existingTicket}`
                )]
            });
            return;
        }

        // Create ticket channel
        const ticketChannel = await interaction.guild?.channels.create({
            name: `ticket-${interaction.user.username}`.toLowerCase(),
            type: ChannelType.GuildText,
            parent: botConfig.ticketCategoryId,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    id: botConfig.staffRoleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ]
        });

        if (!ticketChannel) {
            await interaction.editReply({
                embeds: [createErrorEmbed(
                    'Error',
                    'Unable to create ticket channel'
                )]
            });
            return;
        }

        // Initial ticket message
        const ticketEmbed = new EmbedBuilder()
            .setTitle('🎫 New Ticket')
            .setDescription(`**Created by:** ${interaction.user}\n**Type:** ${type}\n**Reason:**\n${reason}`)
            .setColor(0x5865F2)
            .setTimestamp()
            .setFooter({ text: `ID: ${ticketChannel.id}` });

        const ticketActions = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_claim_${ticketChannel.id}`)
                    .setLabel('Claim Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✋'),
                new ButtonBuilder()
                    .setCustomId(`ticket_close_${ticketChannel.id}`)
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒')
            );

        await ticketChannel.send({
            content: `${interaction.user} <@&${botConfig.staffRoleId}>`,
            embeds: [ticketEmbed],
            components: [ticketActions]
        });

        await interaction.editReply({
            embeds: [createSuccessEmbed(
                'Ticket Created',
                `Your ticket has been created: ${ticketChannel}`
            )]
        });

    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.editReply({
            embeds: [createErrorEmbed(
                'Error',
                'An error occurred while creating the ticket'
            )]
        });
    }
}

async function handleCaptchaInput(interaction: ButtonInteraction) {
    const userId = interaction.customId.split('_')[2];
    
    // Check if the user clicking is the one who needs to verify
    if (interaction.user.id !== userId) {
        await interaction.reply({
            embeds: [createErrorEmbed('Error', 'This verification is not for you!')],
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    
    const session = captchaManager.getSession(userId, interaction.guild!.id);
    if (!session) {
        await interaction.reply({
            embeds: [createErrorEmbed('Error', 'Your verification session has expired. Please leave and rejoin the server.')],
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    
    // Create modal for CAPTCHA input
    const modal = new ModalBuilder()
        .setCustomId(`captcha_modal_${userId}`)
        .setTitle('🔐 CAPTCHA Verification');
    
    const captchaInput = new TextInputBuilder()
        .setCustomId('captcha_answer')
        .setLabel('Enter the 5 characters from the image')
        .setStyle(TextInputStyle.Short)
        .setMinLength(5)
        .setMaxLength(5)
        .setPlaceholder('XXXXX')
        .setRequired(true);
    
    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(captchaInput);
    modal.addComponents(actionRow);
    
    await interaction.showModal(modal);
}

async function handleCaptchaModal(interaction: ModalSubmitInteraction) {
    const userId = interaction.customId.split('_')[2];
    const answer = interaction.fields.getTextInputValue('captcha_answer');
    
    const session = captchaManager.getSession(userId, interaction.guild!.id);
    if (!session) {
        await interaction.reply({
            embeds: [createErrorEmbed('Error', 'Your verification session has expired.')],
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    
    const attempts = captchaManager.incrementAttempts(userId, interaction.guild!.id);
    
    if (captchaManager.isValidAnswer(userId, interaction.guild!.id, answer)) {
        // Correct answer - give role and clean up
        try {
            const member = interaction.guild!.members.cache.get(userId);
            const roleId = '1433418063189119007';
            
            if (member) {
                await member.roles.add(roleId);
                
                await interaction.reply({
                    embeds: [createSuccessEmbed(
                        '✅ Verification Successful!',
                        'Welcome to the server! You now have access to all channels.'
                    )],
                    flags: MessageFlags.Ephemeral
                });
                
                // Delete the CAPTCHA message
                if (session.messageId) {
                    const channel = interaction.channel as TextChannel;
                    const message = await channel.messages.fetch(session.messageId).catch(() => null);
                    if (message) {
                        await message.delete().catch(() => {});
                    }
                }
                
                captchaManager.clearUserSession(userId, interaction.guild!.id);
                console.log(`✅ User ${member.user.tag} successfully verified with CAPTCHA`);
            }
        } catch (error) {
            console.error('Error giving role after CAPTCHA:', error);
            await interaction.reply({
                embeds: [createErrorEmbed('Error', 'Verification successful but failed to assign role. Please contact staff.')],
                flags: MessageFlags.Ephemeral
            });
        }
    } else {
        // Wrong answer
        if (attempts >= 3) {
            // Kick after 3 failed attempts
            try {
                const member = interaction.guild!.members.cache.get(userId);
                if (member) {
                    await member.kick('CAPTCHA verification failed (3 attempts)');
                    console.log(`❌ Kicked ${member.user.tag} for failing CAPTCHA 3 times`);
                    
                    // Delete the CAPTCHA message
                    if (session.messageId) {
                        const channel = interaction.channel as TextChannel;
                        const message = await channel.messages.fetch(session.messageId).catch(() => null);
                        if (message) {
                            await message.delete().catch(() => {});
                        }
                    }
                }
                captchaManager.clearUserSession(userId, interaction.guild!.id);
                
                await interaction.reply({
                    embeds: [createErrorEmbed(
                        '❌ Verification Failed',
                        'You have failed the CAPTCHA verification 3 times and have been removed from the server.'
                    )],
                    flags: MessageFlags.Ephemeral
                });
            } catch (error) {
                console.error('Error kicking user after failed CAPTCHA:', error);
            }
        } else {
            // Show remaining attempts
            const remaining = 3 - attempts;
            await interaction.reply({
                embeds: [createErrorEmbed(
                    '❌ Incorrect CAPTCHA',
                    `The answer is incorrect. You have ${remaining} attempt(s) remaining.\n\nPlease look carefully at the image and try again.`
                )],
                flags: MessageFlags.Ephemeral
            });
        }
    }
}

export default event;
