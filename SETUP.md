# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- Discord Bot Token

## Installation

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your Discord bot settings
# 5. Deploy commands
npm run deploy

# 6. Start the bot
npm start
```

## Configuration

Edit `.env` file:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
WELCOME_CHANNEL_ID=channel_id_here
TICKET_CATEGORY_ID=category_id_here
LOG_CHANNEL_ID=log_channel_id_here
STAFF_ROLE_ID=staff_role_id_here
```

## Features
- ✅ Welcome system with buttons
- ✅ Ticket system with modals
- ✅ Moderation commands (/ban, /kick)
- ✅ Database integration (SQLite)
- ✅ Full TypeScript support

## Commands
- `/help` - Show help
- `/ban <user> [reason] [duration]` - Ban a member
- `/kick <user> [reason]` - Kick a member

## Support
- Check the full README.md for detailed documentation
- All user-facing messages are in English
- Code comments remain in French for maintainers
