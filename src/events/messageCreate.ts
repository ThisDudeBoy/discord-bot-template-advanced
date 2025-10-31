import { Events, Message, EmbedBuilder } from 'discord.js';
import { createErrorEmbed } from '../utils/embeds.js';
import type { BotEvent } from '../types/index.js';

// Regex patterns to detect Discord invites
const discordInvitePatterns = [
    /discord\.gg\/[a-zA-Z0-9\-_]+/gi,
    /discordapp\.com\/invite\/[a-zA-Z0-9\-_]+/gi,
    /discord\.com\/invite\/[a-zA-Z0-9\-_]+/gi,
    /dsc\.gg\/[a-zA-Z0-9\-_]+/gi
];

// Whitelist of allowed Discord servers
const allowedInvites = [
    'discord.gg/devhub', // Your server invite
];

async function checkAndDeleteInvite(message: Message): Promise<void> {
    // Don't moderate bots or admins
    if (message.author.bot) return;
    if (message.member?.permissions.has('Administrator')) return;
    if (message.member?.permissions.has('ManageMessages')) return;
    
    const content = message.content.toLowerCase();
    
    // Check if message contains Discord invites
    const hasInvite = discordInvitePatterns.some(pattern => {
        pattern.lastIndex = 0; // Reset regex
        return pattern.test(content);
    });
    
    if (hasInvite) {
        // Check if it's an allowed invite
        const isAllowed = allowedInvites.some(invite => content.includes(invite.toLowerCase()));
        
        if (!isAllowed) {
            try {
                // Delete the message
                await message.delete();
                
                // Create warning embed
                const warningEmbed = new EmbedBuilder()
                    .setTitle('🚫 Advertising Detected')
                    .setDescription(`${message.author}, advertising other Discord servers is not allowed here.`)
                    .addFields([
                        {
                            name: '⚠️ Warning',
                            value: 'Continued violation may result in a timeout or ban.',
                            inline: false
                        },
                        {
                            name: '📋 Deleted Message',
                            value: `\`\`\`${message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content}\`\`\``,
                            inline: false
                        }
                    ])
                    .setColor(0xff6b6b)
                    .setTimestamp()
                    .setFooter({ text: 'Anti-Advertising System' });
                
                // Send warning message (will auto-delete after 10 seconds)
                if (message.channel.isTextBased()) {
                    const warningMsg = await (message.channel as any).send({ embeds: [warningEmbed] });
                    
                    // Auto-delete warning after 10 seconds
                    setTimeout(async () => {
                        try {
                            await warningMsg.delete();
                        } catch (error) {
                            // Message might already be deleted
                        }
                    }, 10000);
                }
                
                console.log(`🚫 Deleted advertising message from ${message.author.tag}: "${message.content}"`);
                
                // Apply timeout
                try {
                    await message.member?.timeout(5 * 60 * 1000, 'Advertising Discord servers'); // 5 minutes timeout
                    console.log(`⏱️ Timeout applied to ${message.author.tag} for advertising`);
                } catch (error) {
                    console.error('Error applying timeout:', error);
                }
                
            } catch (error) {
                console.error('❌ Error moderating advertising message:', error);
            }
        }
    }
}

const messageCreateEvent: BotEvent = {
    name: Events.MessageCreate,
    async execute(message: Message) {
        await checkAndDeleteInvite(message);
    }
};

export default messageCreateEvent;