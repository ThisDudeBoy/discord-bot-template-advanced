import { Events, ActivityType } from 'discord.js';
import chalk from 'chalk';
import type { BotEvent, ExtendedClient } from '../types/index.js';

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: ExtendedClient) {
        console.log(chalk.green(`✅ Bot connected as ${client.user?.tag}`));
        console.log(chalk.cyan(`📊 Connected to ${client.guilds.cache.size} server(s)`));
        console.log(chalk.cyan(`👥 ${client.users.cache.size} users in cache`));

        // Set bot status
        client.user?.setPresence({
            activities: [
                {
                    name: 'DevHub | /help',
                    type: ActivityType.Watching
                }
            ],
            status: 'online'
        });

        console.log(chalk.magenta('🚀 DevHub Bot is now operational!'));
    }
};

export default event;