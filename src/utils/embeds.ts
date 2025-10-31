import { EmbedBuilder, User, GuildMember } from 'discord.js';
import { botConfig, getColorNumber } from './config.js';
import type { EmbedOptions } from '../types/index.js';

/**
 * Crée un embed avec les options spécifiées
 */
export function createEmbed(options: EmbedOptions): EmbedBuilder {
    const embed = new EmbedBuilder();

    if (options.title) {
        embed.setTitle(options.title);
    }

    if (options.description) {
        embed.setDescription(options.description);
    }

    if (options.color) {
        embed.setColor(getColorNumber(options.color));
    } else {
        embed.setColor(getColorNumber(botConfig.colors.primary));
    }

    if (options.footer) {
        embed.setFooter({ text: options.footer });
    }

    if (options.timestamp) {
        embed.setTimestamp();
    }

    if (options.author) {
        embed.setAuthor({
            name: options.author.name,
            iconURL: options.author.iconURL
        });
    }

    if (options.fields && options.fields.length > 0) {
        embed.addFields(options.fields);
    }

    if (options.thumbnail) {
        embed.setThumbnail(options.thumbnail);
    }

    if (options.image) {
        embed.setImage(options.image);
    }

    return embed;
}

/**
 * Crée un embed de succès
 */
export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
    return createEmbed({
        title: `✅ ${title}`,
        description,
        color: botConfig.colors.success,
        timestamp: true
    });
}

/**
 * Crée un embed d'erreur
 */
export function createErrorEmbed(title: string, description: string): EmbedBuilder {
    return createEmbed({
        title: `❌ ${title}`,
        description,
        color: botConfig.colors.error,
        timestamp: true
    });
}

/**
 * Crée un embed d'avertissement
 */
export function createWarningEmbed(title: string, description: string): EmbedBuilder {
    return createEmbed({
        title: `⚠️ ${title}`,
        description,
        color: botConfig.colors.warning,
        timestamp: true
    });
}

/**
 * Crée un embed d'information
 */
export function createInfoEmbed(title: string, description: string): EmbedBuilder {
    return createEmbed({
        title: `ℹ️ ${title}`,
        description,
        color: botConfig.colors.primary,
        timestamp: true
    });
}

/**
 * Crée un embed pour les messages de bienvenue
 */
export function createWelcomeEmbed(member: GuildMember): EmbedBuilder {
    return createEmbed({
        title: 'Welcome to DevHub! 🎉',
        description: `Hey ${member}! Welcome to our development server.
        
        📋 **Read the rules** in <#rules-channel>
        💬 **Introduce yourself** in <#presentation-channel>
        🎫 **Need help?** Create a ticket with the button below
        
        We're glad to have you with us!`,
        color: botConfig.colors.success,
        thumbnail: member.user.displayAvatarURL({ size: 128 }),
        footer: `Member #${member.guild.memberCount}`,
        timestamp: true
    });
}

/**
 * Crée un embed pour les logs de modération
 */
export function createModerationLogEmbed(
    action: string,
    target: User,
    moderator: User,
    reason?: string,
    duration?: string
): EmbedBuilder {
    const embed = createEmbed({
        title: `🔨 Moderation Action: ${action}`,
        color: botConfig.colors.warning,
        timestamp: true,
        fields: [
            {
                name: 'User',
                value: `${target} (${target.tag})`,
                inline: true
            },
            {
                name: 'Moderator',
                value: `${moderator} (${moderator.tag})`,
                inline: true
            }
        ]
    });

    if (reason) {
        embed.addFields({
            name: 'Reason',
            value: reason,
            inline: false
        });
    }

    if (duration) {
        embed.addFields({
            name: 'Duration',
            value: duration,
            inline: true
        });
    }

    embed.setThumbnail(target.displayAvatarURL({ size: 64 }));

    return embed;
}

/**
 * Crée un embed pour les tickets
 */
export function createTicketEmbed(
    type: 'created' | 'closed',
    user: User,
    ticketId: string,
    reason?: string
): EmbedBuilder {
    const isCreated = type === 'created';
    
    return createEmbed({
        title: isCreated ? '🎫 New Ticket Created' : '🔒 Ticket Closed',
        description: isCreated 
            ? `A new ticket has been created by ${user}`
            : `The ticket has been closed`,
        color: isCreated ? botConfig.colors.success : botConfig.colors.error,
        fields: [
            {
                name: 'Ticket ID',
                value: ticketId,
                inline: true
            },
            {
                name: isCreated ? 'Created by' : 'User',
                value: `${user} (${user.tag})`,
                inline: true
            }
        ],
        thumbnail: user.displayAvatarURL({ size: 64 }),
        timestamp: true
    });
}

/**
 * Tronque le texte si il est trop long pour Discord
 */
export function truncateText(text: string, maxLength: number = 1024): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formate une liste d'éléments pour un embed
 */
export function formatList(items: string[], maxItems: number = 10): string {
    if (items.length === 0) {
        return 'No items';
    }

    const visibleItems = items.slice(0, maxItems);
    let result = visibleItems.map((item, index) => `${index + 1}. ${item}`).join('\n');

    if (items.length > maxItems) {
        result += `\n... and ${items.length - maxItems} more`;
    }

    return result;
}