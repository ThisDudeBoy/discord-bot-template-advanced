// Types for DevHub Bot - Import Discord.js types in implementation files

// Interface pour les commandes slash
export interface SlashCommand {
  data: any; // SlashCommandBuilder
  execute: (interaction: any) => Promise<any>; // ChatInputCommandInteraction
  cooldown?: number;
}

// Interface pour les événements
export interface BotEvent {
  name: string; // keyof ClientEvents
  once?: boolean;
  execute: (...args: any[]) => Promise<void>;
}

// Extension du client Discord.js
export interface ExtendedClient {
  commands: Map<string, SlashCommand>;
  cooldowns: Map<string, Map<string, number>>;
  // Discord Client properties will be available at runtime
  user?: any;
  guilds?: any;
  users?: any;
  login?: (token: string) => Promise<string>;
  on?: (event: string, listener: (...args: any[]) => void) => any;
  once?: (event: string, listener: (...args: any[]) => void) => any;
}

// Configuration du bot
export interface BotConfig {
  token: string;
  clientId: string;
  guildId: string;
  welcomeChannelId: string;
  ticketCategoryId: string;
  logChannelId: string;
  staffRoleId: string;
  colors: {
    primary: string;
    success: string;
    error: string;
    warning: string;
  };

  development: boolean;
}

// Types pour le système de tickets
export interface TicketData {
  id: string;
  userId: string;
  channelId: string;
  categoryId: string;
  type: 'support' | 'report' | 'suggestion' | 'other';
  status: 'open' | 'closed' | 'pending';
  createdAt: Date;
  closedAt?: Date;
  closedBy?: string;
  reason?: string;
}

// Types pour la modération
export interface ModerationAction {
  id: string;
  userId: string;
  moderatorId: string;
  type: 'warn' | 'mute' | 'kick' | 'ban' | 'unban' | 'unmute';
  reason?: string;
  duration?: number; // en millisecondes
  createdAt: Date;
  expiresAt?: Date;
  active: boolean;
}

// Types pour les utilisateurs
export interface UserData {
  id: string;
  username: string;
  discriminator: string;
  joinedAt: Date;
  warnings: number;
  infractions: ModerationAction[];
}

// Types pour les embeds
export interface EmbedOptions {
  title?: string;
  description?: string;
  color?: string;
  footer?: string;
  timestamp?: boolean;
  author?: {
    name: string;
    iconURL?: string;
  };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
  thumbnail?: string;
  image?: string;
}

// Types pour les logs
export interface LogData {
  type: 'moderation' | 'ticket' | 'member' | 'message' | 'error';
  action: string;
  userId?: string;
  moderatorId?: string;
  channelId?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Interface pour les boutons interactifs
export interface ButtonComponent {
  customId: string;
  label: string;
  style: number;
  emoji?: string;
  disabled?: boolean;
}

// Interface pour les modals
export interface ModalComponent {
  customId: string;
  title: string;
  components: any[];
}

export default ExtendedClient;