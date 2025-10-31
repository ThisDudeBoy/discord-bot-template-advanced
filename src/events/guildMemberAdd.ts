import { Events, GuildMember, TextChannel, AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { generateCaptcha } from '../utils/captcha.js';
import { captchaManager } from '../utils/captchaManager.js';
import type { BotEvent } from '../types/index.js';

const event: BotEvent = {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember) {
        const channelId = '1433477899477848094'; // CAPTCHA verification channel
        const roleId = '1433418063189119007'; // Role to give after verification
        
        try {
            const channel = await member.guild.channels.fetch(channelId) as TextChannel;
            if (!channel) {
                console.error('CAPTCHA verification channel not found');
                return;
            }

            // Generate CAPTCHA
            const captcha = generateCaptcha();
            
            // Create session
            captchaManager.createSession(member.id, member.guild.id, captcha.text);

            // Create attachment
            const attachment = new AttachmentBuilder(captcha.buffer, { name: 'captcha.png' });

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle('⚠️ Security Verification Required')
                .setDescription(`Welcome ${member}! Please complete the CAPTCHA verification below to access the server.`)
                .addFields(
                    { name: '📝 Instructions', value: 'Look at the image and type the 5 characters you see.' },
                    { name: '⏱️ Time Limit', value: '10 minutes' },
                    { name: '🔢 Attempts', value: '3 attempts maximum' }
                )
                .setImage('attachment://captcha.png')
                .setColor(0x3498db)
                .setTimestamp();

            // Create buttons
            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`captcha_input_${member.id}`)
                        .setLabel('Enter CAPTCHA')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('✏️')
                );

            const message = await channel.send({
                content: `${member}`,
                embeds: [embed],
                files: [attachment],
                components: [row]
            });

            // Store message ID for cleanup
            captchaManager.setMessageId(member.id, member.guild.id, message.id);

            console.log(`🔐 CAPTCHA verification sent for ${member.user.tag}`);
            
            // Set timeout to kick if not verified in 10 minutes
            setTimeout(async () => {
                const session = captchaManager.getSession(member.id, member.guild.id);
                if (session) {
                    try {
                        await member.kick('CAPTCHA verification timeout (10 minutes)');
                        console.log(`⏰ Kicked ${member.user.tag} for CAPTCHA timeout`);
                        
                        // Delete the CAPTCHA message
                        if (session.messageId) {
                            const msg = await channel.messages.fetch(session.messageId).catch(() => null);
                            if (msg) await msg.delete().catch(() => {});
                        }
                        
                        captchaManager.clearUserSession(member.id, member.guild.id);
                    } catch (error) {
                        console.error('❌ Error kicking user for timeout:', error);
                    }
                }
            }, 10 * 60 * 1000); // 10 minutes
            
        } catch (error) {
            console.error('❌ Error sending CAPTCHA verification:', error);
        }
    }
};

export default event;