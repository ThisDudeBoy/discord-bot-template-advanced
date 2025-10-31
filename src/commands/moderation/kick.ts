import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, GuildMember, MessageFlags } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed, createModerationLogEmbed } from '../../utils/embeds.js';
import { botConfig } from '../../utils/config.js';
import type { SlashCommand } from '../../types/index.js';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
    async execute(interaction: any): Promise<any> {
        const target = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || 'No reason specified';

        // Basic verifications
        if (target.id === interaction.user.id) {
            return await interaction.reply({
                embeds: [createErrorEmbed('Error', 'You cannot kick yourself!')],
                flags: MessageFlags.Ephemeral
            });
        }

        if (target.id === interaction.client.user?.id) {
            return await interaction.reply({
                embeds: [createErrorEmbed('Error', 'I cannot kick myself!')],
                flags: MessageFlags.Ephemeral
            });
        }

        const targetMember = interaction.guild?.members.cache.get(target.id);
        const executor = interaction.member as GuildMember;

        if (!targetMember) {
            return await interaction.reply({
                embeds: [createErrorEmbed('Error', 'This user is not a member of the server!')],
                flags: MessageFlags.Ephemeral
            });
        }

        // Check permissions and hierarchy
        if (targetMember.roles.highest.position >= executor.roles.highest.position) {
            return await interaction.reply({
                embeds: [createErrorEmbed(
                    'Error',
                    'You cannot kick this member because their role is equal or higher than yours!'
                )],
                flags: MessageFlags.Ephemeral
            });
        }

        if (!targetMember.kickable) {
            return await interaction.reply({
                embeds: [createErrorEmbed(
                    'Error',
                    'I cannot kick this member. Check my permissions and role hierarchy.'
                )],
                flags: MessageFlags.Ephemeral
            });
        }

        try {
            // Kick the member
            await targetMember.kick(`${reason} | By: ${interaction.user.tag}`);

            // Success response
            const successEmbed = createSuccessEmbed(
                'Member Kicked',
                `**${target.tag}** has been kicked from the server.\n**Reason:** ${reason}`
            );

            await interaction.reply({ embeds: [successEmbed] });

            // Log to moderation channel
            const logChannel = interaction.guild?.channels.cache.get(botConfig.logChannelId);
            if (logChannel && 'send' in logChannel) {
                const logEmbed = createModerationLogEmbed(
                    'Kick',
                    target,
                    interaction.user,
                    reason
                );

                await logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error('Error during kick:', error);
            await interaction.reply({
                embeds: [createErrorEmbed(
                    'Error',
                    'An error occurred while kicking the member.'
                )],
                flags: MessageFlags.Ephemeral
            });
        }
    },
    cooldown: 3
};

export default command;
