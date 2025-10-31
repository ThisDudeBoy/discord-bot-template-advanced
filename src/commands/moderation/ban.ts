import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, GuildMember, MessageFlags } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed, createModerationLogEmbed } from '../../utils/embeds.js';
import { botConfig } from '../../utils/config.js';
import type { SlashCommand } from '../../types/index.js';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction: any): Promise<any> {
        const target = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || 'No reason specified';

        // Verifications
        if (target.id === interaction.user.id) {
            return await interaction.reply({
                embeds: [createErrorEmbed('Error', 'You cannot ban yourself!')],
                flags: MessageFlags.Ephemeral
            });
        }

        if (target.id === interaction.client.user?.id) {
            return await interaction.reply({
                embeds: [createErrorEmbed('Error', 'I cannot ban myself!')],
                flags: MessageFlags.Ephemeral
            });
        }

        const targetMember = interaction.guild?.members.cache.get(target.id);
        const executor = interaction.member as GuildMember;

        if (targetMember) {
            // Check if user can ban this member
            if (targetMember.roles.highest.position >= executor.roles.highest.position) {
                return await interaction.reply({
                    embeds: [createErrorEmbed(
                        'Error',
                        'You cannot ban this member because their role is equal or higher than yours!'
                    )],
                    flags: MessageFlags.Ephemeral
                });
            }

            if (!targetMember.bannable) {
                return await interaction.reply({
                    embeds: [createErrorEmbed(
                        'Error',
                        'I cannot ban this member. Check my permissions and role hierarchy.'
                    )],
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        try {
            // Ban the user
            const banOptions: any = {
                reason: `${reason} | By: ${interaction.user.tag}`
            };

            await interaction.guild?.members.ban(target, banOptions);

            // Success response
            const successEmbed = createSuccessEmbed(
                'Member Banned',
                `**${target.tag}** has been banned permanently from the server.\n**Reason:** ${reason}`
            );

            await interaction.reply({ embeds: [successEmbed] });

            // Log to moderation channel
            const logChannel = interaction.guild?.channels.cache.get(botConfig.logChannelId);
            if (logChannel && 'send' in logChannel) {
                const logEmbed = createModerationLogEmbed(
                    'Ban',
                    target,
                    interaction.user,
                    reason,
                    'Permanent'
                );

                await logChannel.send({ embeds: [logEmbed] });
            }



        } catch (error) {
            console.error('Error during ban:', error);
            await interaction.reply({
                embeds: [createErrorEmbed(
                    'Error',
                    'An error occurred while banning the member.'
                )],
                flags: MessageFlags.Ephemeral
            });
        }
    },
    cooldown: 5
};

export default command;
