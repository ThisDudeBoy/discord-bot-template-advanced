import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '../../types/index.js';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Test bot latency and response time'),
    
    async execute(interaction: any) {
        const sent = await interaction.deferReply({ fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const wsLatency = interaction.client.ws.ping;

        await interaction.editReply({
            content: `🏓 **Pong!**\n` +
                    `📡 **Latency:** ${latency}ms\n` +
                    `💓 **WebSocket:** ${wsLatency}ms\n` +
                    `⚡ **Status:** ${wsLatency < 100 ? 'Excellent' : wsLatency < 200 ? 'Good' : 'Poor'}`
        });
    },
    
    cooldown: 3
};

export default command;