import { Events, Message, EmbedBuilder } from 'discord.js';
import type { BotEvent } from '../types/index.js';

// Regex patterns to detect Discord invites
const discordInvitePatterns = [
    /discord\.gg\/[a-zA-Z0-9]+/gi,
    /discordapp\.com\/invite\/[a-zA-Z0-9]+/gi,
    /discord\.com\/invite\/[a-zA-Z0-9]+/gi,
    /dsc\.gg\/[a-zA-Z0-9]+/gi
];

// Whitelist of allowed Discord servers
const allowedInvites = [
    'discord.gg/devhub', // Your server invite
];

async function checkEditedMessage(oldMessage: Message, newMessage: Message): Promise<void> {
    // Don't moderate bots or admins
    if (newMessage.author.bot) return;
    if (newMessage.member?.permissions.has('Administrator')) return;
    if (newMessage.member?.permissions.has('ManageMessages')) return;
    
    const content = newMessage.content.toLowerCase();
    
    // Check if edited message now contains Discord invites
    const hasInvite = discordInvitePatterns.some(pattern => pattern.test(content));
    
    if (hasInvite) {
        // Check if it's an allowed invite
        const isAllowed = allowedInvites.some(invite => content.includes(invite.toLowerCase()));
        
        if (!isAllowed) {
            try {
                // Delete the edited message
                await newMessage.delete();
                
                // Create warning embed
                const warningEmbed = new EmbedBuilder()
                    .setTitle('🚫 Advertising Detected (Edited Message)')
                    .setDescription(`${newMessage.author}, advertising other Discord servers is not allowed here.`)
                    .addFields([
                        {
                            name: '⚠️ Warning',
                            value: 'Editing messages to include advertisements is not allowed.',
                            inline: false
                        },
                        {
                            name: '📋 Original Message',
                            value: `\`\`\`${oldMessage.content.length > 50 ? oldMessage.content.substring(0, 50) + '...' : oldMessage.content || '[No content]'}\`\`\``,
                            inline: false
                        },
                        {
                            name: '📝 Edited To',
                            value: `\`\`\`${newMessage.content.length > 50 ? newMessage.content.substring(0, 50) + '...' : newMessage.content}\`\`\``,
                            inline: false
                        }
                    ])
                    .setColor(0xff3838)
                    .setTimestamp()
                    .setFooter({ text: 'Anti-Advertising System • Message Edit Detection' });
                
                // Send warning message (will auto-delete after 15 seconds)
                if (newMessage.channel.isTextBased()) {
                    const warningMsg = await (newMessage.channel as any).send({ embeds: [warningEmbed] });
                    
                    // Auto-delete warning after 15 seconds
                    setTimeout(async () => {
                        try {
                            await warningMsg.delete();
                        } catch (error) {
                            // Message might already be deleted
                        }
                    }, 15000);
                }
                
                console.log(`🚫 Deleted edited advertising message from ${newMessage.author.tag}`);
                console.log(`   Original: "${oldMessage.content}"`);
                console.log(`   Edited to: "${newMessage.content}"`);
                
            } catch (error) {
                console.error('❌ Error moderating edited advertising message:', error);
            }
        }
    }
}

const messageUpdateEvent: BotEvent = {
    name: Events.MessageUpdate,
    async execute(oldMessage: Message, newMessage: Message) {
        // Only process if both messages are fully loaded
        if (oldMessage.partial || newMessage.partial) return;
        
        await checkEditedMessage(oldMessage, newMessage);
    }
};

export default messageUpdateEvent;