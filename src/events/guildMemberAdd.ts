import { Events, GuildMember, TextChannel, AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { generateCaptcha } from '../utils/captcha.js';
import { captchaManager } from '../utils/captchaManager.js';
import { botConfig } from '../utils/config.js';
import type { BotEvent } from '../types/index.js';

// Funny welcome messages array
const welcomeMessages = [
    "🎉 Look who decided to join the party! Welcome {user}!",
    "🚀 {user} just landed! Houston, we have a new member!",
    "🎊 *Confetti falls from the sky* Welcome {user} to our awesome community!",
    "🔥 Things just got a bit more awesome! Welcome {user}!",
    "🎭 The stage is set, the lights are on... Welcome {user}!",
    "🌟 A new star has appeared in our galaxy! Welcome {user}!",
    "🎪 Step right up! Welcome to the greatest server on Earth, {user}!",
    "🏰 The gates have opened for {user}! Welcome to our kingdom!",
    "🎯 Bullseye! {user} found the perfect server! Welcome!",
    "🎨 Adding some color to our community... Welcome {user}!",
    "⚡ *Thunder crashes* The legendary {user} has arrived!",
    "🎵 *Epic music plays* Welcome {user} to the symphony of awesomeness!",
    "🏆 We just got an upgrade! Welcome {user}!",
    "🌈 After the storm comes the rainbow... and {user}! Welcome!",
    "🚪 *Door creaks open* Who dares enter our realm? Oh, it's {user}! Welcome!",
    "🎲 Rolling the dice... and we got {user}! Lucky us! Welcome!",
    "🎪 Ladies and gentlemen, presenting... {user}! *Round of applause*",
    "🌍 One small step for {user}, one giant leap for our community!",
    "🔮 The prophecy foretold of {user}'s arrival... Welcome!",
    "🎈 Pop! Another balloon joins our party! Welcome {user}!",
];

/**
 * Send a welcome message to the welcome channel
 * @param member - The guild member that joined
 */
async function sendWelcomeMessage(member: GuildMember): Promise<void> {
    try {
        const welcomeChannel = await member.guild.channels.fetch(botConfig.welcomeChannelId) as TextChannel;
        if (!welcomeChannel) {
            console.error('❌ Welcome channel not found');
            return;
        }

        // Get a random welcome message
        const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        const welcomeText = randomMessage.replace('{user}', member.toString());

        // Create welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎉 Welcome to the Server!')
            .setDescription(welcomeText)
            .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '👤 Member', value: member.user.tag, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 Member Count', value: `${member.guild.memberCount}`, inline: true }
            )
            .setColor(0x57F287) // Success green color
            .setTimestamp()
            .setFooter({ 
                text: `Welcome #${member.guild.memberCount}`, 
                iconURL: member.guild.iconURL() || undefined 
            });

        await welcomeChannel.send({ embeds: [welcomeEmbed] });
        console.log(`🎉 Welcome message sent for ${member.user.tag}`);
        
    } catch (error) {
        console.error('❌ Error sending welcome message:', error);
    }
}

const event: BotEvent = {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember) {
        // Send welcome message first
        await sendWelcomeMessage(member);
        
        // Then handle CAPTCHA verification
        const channelId = botConfig.captchaChannelId; // CAPTCHA verification channel
        const roleId = botConfig.verifiedRoleId; // Role to give after verification
        
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