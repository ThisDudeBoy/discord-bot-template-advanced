import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/index.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Display detailed bot information and statistics'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const client = interaction.client;
        
        // Get package.json for version info
        let packageInfo;
        try {
            const packagePath = join(__dirname, '..', '..', '..', 'package.json');
            const packageData = readFileSync(packagePath, 'utf8');
            packageInfo = JSON.parse(packageData);
        } catch (error) {
            packageInfo = { name: 'DevHub Bot', version: '1.0.0' };
        }
        
        // Calculate uptime
        const uptime = process.uptime();
        const uptimeFormatted = formatUptime(uptime);
        
        // Memory usage
        const memoryUsage = process.memoryUsage();
        const memoryFormatted = `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`;
        
        // Get creation date
        const createdAt = client.user?.createdAt;
        const createdFormatted = createdAt ? `<t:${Math.floor(createdAt.getTime() / 1000)}:R>` : 'Unknown';
        
        // Calculate total members across all guilds
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        
        // Get different channel types
        const textChannels = client.channels.cache.filter(c => c.isTextBased()).size;
        const voiceChannels = client.channels.cache.filter(c => c.isVoiceBased()).size;
        
        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: `${client.user?.username} Information`, 
                iconURL: client.user?.displayAvatarURL() || undefined 
            })
            .setTitle('🚀 DevHub Manager Bot')
            .setDescription('*A powerful Discord bot for managing your server with advanced features*')
            .setColor(0x00D9FF)
            .addFields([
                {
                    name: '🤖 **Bot Identity**',
                    value: [
                        `**Name:** ${client.user?.username}`,
                        `**Tag:** ${client.user?.tag}`,
                        `**ID:** \`${client.user?.id}\``,
                        `**Created:** ${createdFormatted}`
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📊 **Server Statistics**',
                    value: [
                        `**Servers:** \`${client.guilds.cache.size.toLocaleString()}\``,
                        `**Total Members:** \`${totalMembers.toLocaleString()}\``,
                        `**Cached Users:** \`${client.users.cache.size.toLocaleString()}\``,
                        `**Roles:** \`${client.guilds.cache.reduce((acc, g) => acc + g.roles.cache.size, 0).toLocaleString()}\``
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '📺 **Channel Information**',
                    value: [
                        `**Total Channels:** \`${client.channels.cache.size.toLocaleString()}\``,
                        `**Text Channels:** \`${textChannels.toLocaleString()}\``,
                        `**Voice Channels:** \`${voiceChannels.toLocaleString()}\``,
                        `**Categories:** \`${client.channels.cache.filter(c => c.type === 4).size.toLocaleString()}\``
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⚙️ **Technical Details**',
                    value: [
                        `**Version:** \`${packageInfo.version}\``,
                        `**Node.js:** \`${process.version}\``,
                        `**Memory Usage:** \`${memoryFormatted}\``,
                        `**Platform:** \`${process.platform}\``
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🕐 **Runtime Information**',
                    value: [
                        `**Uptime:** \`${uptimeFormatted}\``,
                        `**Ping:** \`${client.ws.ping}ms\``,
                        `**Ready Since:** <t:${Math.floor(client.readyTimestamp! / 1000)}:R>`,
                        `**Commands Loaded:** \`${(client as any).commands?.size || 'Unknown'}\``
                    ].join('\n'),
                    inline: true
                },

            ])
            .setThumbnail(client.user?.displayAvatarURL({ size: 256 }) || null)
            .setFooter({ 
                text: `Requested by ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed]
        });
    }
};

// Helper function to format uptime
function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);
    
    return parts.join(' ') || '0s';
}

export default command;