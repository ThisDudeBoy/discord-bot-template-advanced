import { Events, GuildMember, TextChannel } from 'discord.js';
import { captchaManager } from '../utils/captchaManager.js';
import type { BotEvent } from '../types/index.js';

const event: BotEvent = {
    name: Events.GuildMemberRemove,
    async execute(member: GuildMember) {
        const channelId = '1433477899477848094'; // CAPTCHA verification channel
        
        try {
            // Check if user had a pending CAPTCHA session
            const session = captchaManager.getSession(member.id, member.guild.id);
            
            if (session && session.messageId) {
                const channel = await member.guild.channels.fetch(channelId) as TextChannel;
                
                if (channel) {
                    // Delete the CAPTCHA message
                    const message = await channel.messages.fetch(session.messageId).catch(() => null);
                    if (message) {
                        await message.delete().catch(() => {});
                        console.log(`🗑️ Deleted CAPTCHA message for ${member.user.tag} who left the server`);
                    }
                }
                
                // Clear the session
                captchaManager.clearUserSession(member.id, member.guild.id);
            }
            
        } catch (error) {
            console.error('❌ Error cleaning up CAPTCHA for departed member:', error);
        }
    }
};

export default event;