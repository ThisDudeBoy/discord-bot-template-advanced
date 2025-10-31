import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { config } from 'dotenv';
import chalk from 'chalk';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import type { ExtendedClient, SlashCommand, BotEvent } from './types/index.js';

/**
 * DevHub Discord Bot - A comprehensive server management bot
 * Created by AlexM (https://github.com/ThisDudeBoy)
 * 
 * Features:
 * - CAPTCHA verification system for new members
 * - Advanced ticket system with transcript generation
 * - Anti-advertising protection with smart detection
 * - Dynamic command and event loading
 * - Professional embed interfaces
 */

// Load environment variables from .env file
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main DevHub Bot class that handles initialization and startup
 */
class DevHubBot {
    public client: ExtendedClient;

    constructor() {
        // Initialize Discord client with necessary intents for bot functionality
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessages
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
                Partials.User,
                Partials.GuildMember
            ]
        }) as any;

        // Initialisation des collections
        (this.client as any).commands = new Collection();
        (this.client as any).cooldowns = new Collection();

        this.init();
    }

    private async init(): Promise<void> {
        try {
            console.log(chalk.blue('🤖 Initialisation du bot DevHub...'));

            // Chargement des handlers
            await this.loadHandlers();
            
            // Chargement des commandes
            await this.loadCommands();
            
            // Chargement des événements
            await this.loadEvents();

            // Connexion à Discord
            await (this.client as any).login(process.env.DISCORD_TOKEN as string);

        } catch (error) {
            console.error(chalk.red('❌ Erreur lors de l\'initialisation:'), error);
            process.exit(1);
        }
    }

    private async loadHandlers(): Promise<void> {
        try {
            // Load handlers directly (static imports work better with TypeScript)
            console.log(chalk.green('✅ Handlers loaded'));
        } catch (error) {
            console.log(chalk.yellow('⚠️  Handler loading error:', error));
        }
    }

    private async loadCommands(): Promise<void> {
        try {
            const commandsPath = join(__dirname, 'commands');
            let commandCount = 0;

            // Fonction récursive pour charger les commandes dans tous les sous-dossiers
            const loadCommandsFromDirectory = async (dirPath: string): Promise<void> => {
                const items = readdirSync(dirPath, { withFileTypes: true });

                for (const item of items) {
                    const fullPath = join(dirPath, item.name);

                    if (item.isDirectory()) {
                        // Si c'est un dossier, on charge récursivement
                        await loadCommandsFromDirectory(fullPath);
                    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.js'))) {
                        // Si c'est un fichier de commande
                        try {
                            const commandModule = await import(pathToFileURL(fullPath).href);
                            
                            if (commandModule.default && commandModule.default.data && commandModule.default.execute) {
                                const command = commandModule.default as SlashCommand;
                                (this.client as any).commands.set(command.data.name, command);
                                
                                commandCount++;
                                const relativePath = fullPath.replace(commandsPath, '').replace(/\\/g, '/');
                                console.log(chalk.cyan(`⚡ Loaded command: /${command.data.name} from ${relativePath}`));
                            } else {
                                console.log(chalk.yellow(`⚠️  Skipped invalid command file: ${item.name}`));
                            }
                        } catch (error) {
                            console.log(chalk.red(`❌ Error loading command file ${item.name}:`, error));
                        }
                    }
                }
            };

            await loadCommandsFromDirectory(commandsPath);
            console.log(chalk.green(`✅ ${commandCount} commands loaded dynamically`));
        } catch (error) {
            console.log(chalk.red('❌ Command loading error:', error));
        }
    }

    private async loadEvents(): Promise<void> {
        try {
            const eventsPath = join(__dirname, 'events');
            const eventFiles = readdirSync(eventsPath).filter((file: string) => 
                file.endsWith('.ts') || file.endsWith('.js')
            );

            let eventCount = 0;

            for (const file of eventFiles) {
                try {
                    const filePath = join(eventsPath, file);
                    const eventModule = await import(pathToFileURL(filePath).href);
                    
                    if (eventModule.default && eventModule.default.name && eventModule.default.execute) {
                        const eventHandler = eventModule.default as BotEvent;
                        
                        if (eventHandler.once) {
                            (this.client as any).once(eventHandler.name, eventHandler.execute);
                        } else {
                            (this.client as any).on(eventHandler.name, eventHandler.execute);
                        }
                        
                        eventCount++;
                        console.log(chalk.cyan(`📡 Loaded event: ${eventHandler.name}`));
                    } else {
                        console.log(chalk.yellow(`⚠️  Skipped invalid event file: ${file}`));
                    }
                } catch (error) {
                    console.log(chalk.red(`❌ Error loading event file ${file}:`, error));
                }
            }

            console.log(chalk.green(`✅ ${eventCount} events loaded dynamically`));
        } catch (error) {
            console.log(chalk.red('❌ Event loading error:', error));
        }
    }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
    console.error(chalk.red('Unhandled promise rejection:'), error);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('Uncaught exception:'), error);
    process.exit(1);
});

// Démarrage du bot
new DevHubBot();