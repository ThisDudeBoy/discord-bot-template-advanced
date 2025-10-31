import { config } from 'dotenv';
import type { BotConfig } from '../types/index.js';

// Chargement des variables d'environnement
config();

// Validation des variables d'environnement requises
const requiredEnvVars = [
    'DISCORD_TOKEN',
    'CLIENT_ID',
    'GUILD_ID',
    'WELCOME_CHANNEL_ID',
    'CAPTCHA_CHANNEL_ID',
    'VERIFIED_ROLE_ID',
    'TICKET_CATEGORY_ID',
    'LOG_CHANNEL_ID',
    'STAFF_ROLE_ID'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Variable d'environnement manquante: ${envVar}`);
        process.exit(1);
    }
}

// Configuration du bot
export const botConfig: BotConfig = {
    token: process.env.DISCORD_TOKEN!,
    clientId: process.env.CLIENT_ID!,
    guildId: process.env.GUILD_ID!,
    welcomeChannelId: process.env.WELCOME_CHANNEL_ID!,
    captchaChannelId: process.env.CAPTCHA_CHANNEL_ID!,
    verifiedRoleId: process.env.VERIFIED_ROLE_ID!,
    ticketCategoryId: process.env.TICKET_CATEGORY_ID!,
    logChannelId: process.env.LOG_CHANNEL_ID!,
    staffRoleId: process.env.STAFF_ROLE_ID!,
    colors: {
        primary: process.env.PRIMARY_COLOR || '#5865F2',
        success: process.env.SUCCESS_COLOR || '#57F287',
        error: process.env.ERROR_COLOR || '#ED4245',
        warning: process.env.WARNING_COLOR || '#FEE75C'
    },

    development: process.env.DEVELOPMENT === 'true'
};

// Fonction pour obtenir une couleur hexadécimale en nombre
export function getColorNumber(colorHex: string): number {
    return parseInt(colorHex.replace('#', ''), 16);
}

// Fonction pour valider les IDs Discord (Snowflakes)
export function isValidSnowflake(id: string): boolean {
    const snowflakeRegex = /^\d{17,19}$/;
    return snowflakeRegex.test(id);
}

// Fonction pour formater la durée en millisecondes en texte lisible
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}j ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

// Fonction pour parser une durée depuis un texte (ex: "1d 2h 30m")
export function parseDuration(text: string): number | null {
    const regex = /(\d+)([dhms])/g;
    let totalMs = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case 'd':
                totalMs += value * 24 * 60 * 60 * 1000;
                break;
            case 'h':
                totalMs += value * 60 * 60 * 1000;
                break;
            case 'm':
                totalMs += value * 60 * 1000;
                break;
            case 's':
                totalMs += value * 1000;
                break;
        }
    }

    return totalMs > 0 ? totalMs : null;
}

export default botConfig;