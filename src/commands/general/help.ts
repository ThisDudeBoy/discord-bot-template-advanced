import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { botConfig, getColorNumber } from '../../utils/config.js';
import type { SlashCommand } from '../../types/index.js';

const command: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display the list of available commands')
        .addStringOption(option =>
            option
                .setName('command')
                .setDescription('Get details about a specific command')
                .setRequired(false)
        ),
    
    async execute(interaction: ChatInputCommandInteraction) {
        const commandName = interaction.options.getString('command');

        if (commandName) {
            // Show help for a specific command
            await showCommandHelp(interaction, commandName);
        } else {
            // Show all commands list
            await showAllCommands(interaction);
        }
    }
};

async function showAllCommands(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as any;
    const commands = client.commands;

    if (!commands || commands.size === 0) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ No Commands Found')
            .setDescription('No commands are currently loaded.')
            .setColor(getColorNumber(botConfig.colors.error))
            .setTimestamp();
            
        await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        return;
    }

    // Group commands by category
    const generalCommands: string[] = [];
    const moderationCommands: string[] = [];
    const otherCommands: string[] = [];

    commands.forEach((command: any) => {
        const commandInfo = `\`/${command.data.name}\` - ${command.data.description}`;
        
        if (command.data.name === 'help' || command.data.name === 'ping') {
            generalCommands.push(commandInfo);
        } else if (command.data.name === 'ban' || command.data.name === 'kick' || command.data.name === 'warn' || command.data.name === 'mute') {
            moderationCommands.push(commandInfo);
        } else {
            otherCommands.push(commandInfo);
        }
    });

    const embed = new EmbedBuilder()
        .setTitle('🤖 DevHub Bot - Commands')
        .setDescription(`Here are all **${commands.size}** available commands:`)
        .setColor(getColorNumber(botConfig.colors.primary))
        .setTimestamp();

    // Add fields for each category that has commands
    if (generalCommands.length > 0) {
        embed.addFields({
            name: '🔧 General Commands',
            value: generalCommands.join('\n'),
            inline: false
        });
    }

    if (moderationCommands.length > 0) {
        embed.addFields({
            name: '🛡️ Moderation Commands',
            value: moderationCommands.join('\n'),
            inline: false
        });
    }

    if (otherCommands.length > 0) {
        embed.addFields({
            name: '⚙️ Other Commands',
            value: otherCommands.join('\n'),
            inline: false
        });
    }

    embed.setFooter({ 
        text: `Use /help <command> for detailed information • DevHub Bot v1.0`,
        iconURL: interaction.client.user?.displayAvatarURL()
    });

    await interaction.reply({ embeds: [embed] });
}

async function showCommandHelp(interaction: ChatInputCommandInteraction, commandName: string): Promise<void> {
    const client = interaction.client as any;
    const commands = client.commands;

    if (!commands || !commands.has(commandName.toLowerCase())) {
        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Command Not Found')
            .setDescription(`The command \`${commandName}\` does not exist.\nUse \`/help\` to see all available commands.`)
            .setColor(getColorNumber(botConfig.colors.error))
            .setTimestamp();
            
        await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
        return;
    }

    const command = commands.get(commandName.toLowerCase());
    const commandData = command.data;

    const embed = new EmbedBuilder()
        .setTitle(`📖 Help - /${commandData.name}`)
        .setDescription(commandData.description)
        .setColor(getColorNumber(botConfig.colors.primary))
        .setTimestamp();

    // Add usage information based on command options
    if (commandData.options && commandData.options.length > 0) {
        const usage = buildUsageString(commandData);
        embed.addFields({
            name: '📝 Usage',
            value: `\`${usage}\``,
            inline: false
        });

        // Add options details
        const optionsInfo = commandData.options.map((option: any) => {
            const required = option.required ? '**[Required]**' : '*[Optional]*';
            return `• **${option.name}** ${required} - ${option.description}`;
        }).join('\n');

        embed.addFields({
            name: '⚙️ Parameters',
            value: optionsInfo,
            inline: false
        });
    } else {
        embed.addFields({
            name: '📝 Usage',
            value: `\`/${commandData.name}\``,
            inline: false
        });
    }

    // Add permissions info for moderation commands
    if (commandData.name === 'ban' || commandData.name === 'kick') {
        const permissionName = commandData.name === 'ban' ? 'Ban Members' : 'Kick Members';
        embed.addFields({
            name: '🔒 Required Permissions',
            value: permissionName,
            inline: false
        });
    }

    // Add examples
    const examples = generateExamples(commandData.name, commandData.options);
    if (examples.length > 0) {
        embed.addFields({
            name: '💡 Examples',
            value: examples.map(example => `\`${example}\``).join('\n'),
            inline: false
        });
    }

    await interaction.reply({ embeds: [embed] });
}

function buildUsageString(commandData: any): string {
    let usage = `/${commandData.name}`;
    
    if (commandData.options && commandData.options.length > 0) {
        const optionStrings = commandData.options.map((option: any) => {
            return option.required ? `<${option.name}>` : `[${option.name}]`;
        });
        usage += ' ' + optionStrings.join(' ');
    }
    
    return usage;
}

function generateExamples(commandName: string, options?: any[]): string[] {
    const examples: string[] = [];
    
    switch (commandName) {
        case 'help':
            examples.push('/help', '/help ban', '/help kick', '/help ping', '/help botinfo');
            break;
        case 'ping':
            examples.push('/ping');
            break;
        case 'botinfo':
            examples.push('/botinfo');
            break;
        case 'ban':
            examples.push('/ban @BadUser', '/ban @Spammer reason:Excessive spamming');
            break;
        case 'kick':
            examples.push('/kick @Troublemaker', '/kick @RuleBreaker reason:Breaking server rules');
            break;
        default:
            examples.push(`/${commandName}`);
    }
    
    return examples;
}

export default command;
