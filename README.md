# 🤖 DevHub Discord Bot

A comprehensive Discord bot for server management with CAPTCHA verification, advanced ticket system, and anti-advertising protection.

**Created by [AlexM](https://github.com/ThisDudeBoy) 🚀**

## ✨ Features

### 🔐 CAPTCHA Verification System
- **Visual CAPTCHA** generation for new members
- **Automatic role assignment** after successful verification
- **Smart cleanup** system that removes CAPTCHA messages when users leave
- **Configurable timeout** (10 minutes) with automatic kick
- **3-attempt limit** with kick on failure

### 🛡️ Anti-Advertising Protection
- **Real-time detection** of Discord invite links
- **Message editing protection** - catches ads added via message edits
- **Whitelist system** for allowed server invites
- **Automatic timeout** for violators (5 minutes)
- **Smart regex patterns** for comprehensive detection

### 🎫 Advanced Ticket System
- **6 ticket categories**: Technical Support, General Help, Suggestions, Reports, Partnerships, Other
- **Transcript generation** with multiple fallback services (paste.ee, dpaste)
- **Direct message notifications** with transcript links when tickets close
- **Professional embed interface** with buttons and modals
- **Staff role pinging** for immediate attention

### 🎉 Welcome System
- **20+ funny welcome messages** with random selection
- **User mention integration** for personal touch
- **Configurable welcome channel**

### ⚙️ Bot Management
- **Dynamic command/event loading** from filesystem
- **Professional `/botinfo` command** with detailed statistics
- **Comprehensive error handling** and logging
- **TypeScript-first** development with full type safety

### 🔨 Moderation Commands
- `/ban` - Ban members with reason logging
- `/kick` - Kick members with reason logging
- `/help` - Dynamic help system with all commands
- `/ping` - Latency testing
- `/botinfo` - Detailed bot statistics and information

## 🛠️ Installation

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** package manager
- A **Discord Application** created at [Discord Developer Portal](https://discord.com/developers/applications)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ThisDudeBoy/devhub-discord-bot.git
   cd devhub-discord-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file with your Discord bot credentials:
   ```env
   # Discord Configuration
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_application_id_here
   GUILD_ID=your_guild_id_for_testing

   # Channel Configuration
   WELCOME_CHANNEL_ID=your_welcome_channel_id
   TICKET_CATEGORY_ID=your_ticket_category_id
   LOG_CHANNEL_ID=your_log_channel_id
   STAFF_ROLE_ID=your_staff_role_id

   # Environment
   NODE_ENV=production
   ```

4. **Deploy slash commands**
   ```bash
   npm run deploy
   ```

5. **Start the bot**
   ```bash
   # Production
   npm run start:dev
   
   # Development with auto-reload
   npm run dev
   ```

## 📁 Project Structure

```
devhub-discord-bot/
├── 📂 src/
│   ├── 📂 commands/           # Slash commands (auto-loaded)
│   │   ├── 📂 general/        # General commands
│   │   │   ├── help.ts        # Dynamic help system
│   │   │   ├── ping.ts        # Latency testing
│   │   │   └── botinfo.ts     # Bot statistics
│   │   └── 📂 moderation/     # Moderation commands
│   │       ├── ban.ts         # Ban command with logging
│   │       └── kick.ts        # Kick command with logging
│   ├── 📂 events/             # Discord events (auto-loaded)
│   │   ├── ready.ts           # Bot ready event
│   │   ├── guildMemberAdd.ts  # CAPTCHA system
│   │   ├── guildMemberRemove.ts # CAPTCHA cleanup
│   │   ├── interactionCreate.ts # Commands, buttons, modals
│   │   ├── messageCreate.ts   # Anti-advertising (new messages)
│   │   └── messageUpdate.ts   # Anti-advertising (message edits)
│   ├── 📂 utils/              # Utility functions
│   │   ├── captcha.ts         # CAPTCHA generation with Canvas
│   │   ├── captchaManager.ts  # Session management
│   │   ├── config.ts          # Bot configuration
│   │   └── embeds.ts          # Reusable embed builders
│   ├── 📂 types/              # TypeScript definitions
│   │   └── index.ts           # Interface definitions
│   └── index.ts               # Main bot entry point
├── 📄 package.json            # Dependencies and scripts
├── 📄 tsconfig.json          # TypeScript configuration
└── 📄 README.md              # This file
```

## 🎨 Technologies Used

- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Discord.js v14](https://discord.js.org/)** - Modern Discord API wrapper
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment
- **[Canvas](https://www.npmjs.com/package/canvas)** - CAPTCHA image generation
- **[Axios](https://axios-http.com/)** - HTTP client for transcript uploads
- **[Chalk](https://www.npmjs.com/package/chalk)** - Terminal styling for logs

## ⚙️ Configuration Guide

### Channel Setup
Replace the IDs in your `.env` file with your server's specific channel IDs:

```env
# CAPTCHA verification channel (where new members get CAPTCHA)
WELCOME_CHANNEL_ID=your_welcome_channel_id

# Role given after CAPTCHA completion
# (Add this to your bot configuration)
VERIFIED_ROLE_ID=your_verified_role_id

# Ticket category (where ticket channels are created)
TICKET_CATEGORY_ID=your_ticket_category_id

# Staff role (gets pinged for new tickets)
STAFF_ROLE_ID=your_staff_role_id
```

### Anti-Advertising Whitelist
Edit `src/events/messageCreate.ts` to add allowed Discord servers:

```typescript
const allowedInvites = [
    'discord.gg/your-server-invite', // Add your server invites here
];
```

## 🚀 Deployment

### Development
```bash
npm run start:dev  # Run with tsx (TypeScript execution)
npm run dev        # Run with auto-reload on file changes
```

### Production
```bash
npm run build      # Compile TypeScript to JavaScript
npm start          # Run compiled JavaScript
```

## 🤝 Contributing

Want to contribute? Awesome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Use **TypeScript** for all new code
- Follow existing **code style** and patterns
- Add **JSDoc comments** for functions
- Test thoroughly before submitting PRs

## 📝 Changelog

### v1.0.0 (Current)
- ✅ **CAPTCHA verification system** with visual challenges
- ✅ **Advanced ticket system** with 6 categories and transcripts
- ✅ **Anti-advertising protection** with regex detection
- ✅ **Dynamic command/event loading** from filesystem
- ✅ **Professional embed interfaces** throughout
- ✅ **TypeScript-first development** with full type safety
- ✅ **Comprehensive error handling** and logging

## 🐛 Known Issues

Currently no known issues! 🎉

If you find any bugs, please [create an issue](https://github.com/ThisDudeBoy/devhub-discord-bot/issues).

## 💬 Support

Need help? Here are your options:

1. 📖 **Read the documentation** (this README)
2. 🔍 **Check existing issues** on GitHub
3. 🆕 **Create a new issue** if needed
4. 💬 **Join our Discord** (coming soon)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This bot is provided "as is" without warranty. Use at your own risk and ensure compliance with Discord's Terms of Service.

## 🙏 Acknowledgments

- **Discord.js Team** for the amazing library
- **Canvas contributors** for CAPTCHA generation capabilities
- **TypeScript Team** for type safety
- **The Discord Bot community** for inspiration and best practices

---

**Made with ❤️ by [AlexM](https://github.com/ThisDudeBoy)**

⭐ **Star this repo if it helped you!** ⭐