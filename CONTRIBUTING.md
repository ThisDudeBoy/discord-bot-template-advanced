# Contributing to Discord Bot Template Advanced

First off, thank you for considering contributing to this Discord bot template! 🎉

**Created by [AlexM](https://github.com/ThisDudeBoy)**

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Style Guidelines](#style-guidelines)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 How to Contribute

### Reporting Bugs 🐛
- Use the GitHub issue tracker with bug template
- Search existing issues before creating new ones
- Include detailed information:
  - Node.js version (18.0.0+ required)
  - Discord.js version (v14.x)
  - TypeScript version
  - Operating System
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots/logs if applicable
  - Error messages in full

### Suggesting Features ✨
- Open an issue with the "enhancement" label
- Use the feature request template
- Clearly describe the feature and its benefits
- Include examples of how it would work
- Consider if it fits the template's scope and purpose
- Check Discord.js v14 compatibility
- Consider TypeScript implementation

### Code Contributions 💻
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## 🛠️ Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/discord-bot-template-advanced.git
cd discord-bot-template-advanced

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Fill in your Discord bot credentials

# Run in development mode
npm run dev
```

## 📝 Pull Request Process

1. **Update Documentation**: Update README.md if you add features
2. **Test Your Changes**: Ensure all existing functionality still works
3. **Follow Code Style**: Use TypeScript and follow existing patterns
4. **Clear Commit Messages**: Use descriptive commit messages
5. **Link Issues**: Reference any related issues in your PR description

### PR Checklist ✅
- [ ] Code follows TypeScript best practices (strict mode)
- [ ] All functions have JSDoc comments with proper types
- [ ] Error handling is implemented with try/catch blocks
- [ ] Use Chalk logging instead of console.log
- [ ] Discord.js v14 compatibility ensured
- [ ] No deprecated Discord.js methods used
- [ ] Environment variables properly typed
- [ ] README/SETUP.md updated if needed
- [ ] Code formatted with Prettier (if configured)
- [ ] ESLint rules followed

## 🐛 Issue Guidelines

### Bug Reports
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Environment:**
- OS: [e.g. Windows 10, Ubuntu 20.04]
- Node.js version: [e.g. 18.17.0]
- Bot version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

### Feature Requests
```markdown
**Feature Description**
A clear description of what you want to happen.

**Use Case**
Why is this feature needed? What problem does it solve?

**Implementation Ideas**
If you have ideas on how to implement this, describe them here.
```

## 🎨 Style Guidelines

### TypeScript Code Style
```typescript
// ✅ Good - Clear function with JSDoc
/**
 * Process CAPTCHA verification for a user
 * @param userId - Discord user ID
 * @param answer - User's CAPTCHA answer
 * @returns Promise<boolean> - True if verification successful
 */
async function verifyCaptcha(userId: string, answer: string): Promise<boolean> {
    // Implementation here
}

// ❌ Bad - No documentation, unclear naming
async function verify(id: string, ans: string): Promise<any> {
    // Implementation here
}
```

### Commit Message Format
```
type(scope): brief description

Examples:
feat(captcha): add image generation with noise
fix(tickets): resolve transcript upload failure
docs(readme): update installation instructions
refactor(events): improve error handling
```

### File Organization
- Commands go in `src/commands/[category]/`
- Events go in `src/events/`
- Utilities go in `src/utils/`
- Types go in `src/types/`
- Follow existing naming conventions

### Error Handling
```typescript
// ✅ Good - Proper error handling
try {
    await riskyOperation();
    console.log('✅ Operation successful');
} catch (error) {
    console.error('❌ Operation failed:', error);
    // Handle the error appropriately
}

// ❌ Bad - Silent failures
try {
    await riskyOperation();
} catch (error) {
    // Ignoring errors is bad!
}
```

## 🏷️ Labels

We use these labels to categorize issues and PRs:
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - Important issues
- `priority: low` - Nice to have

## 🎯 Development Priorities

Current focus areas (in order):
1. **Bug fixes** - Stability is key
2. **Performance improvements** - Make it faster
3. **New moderation features** - Enhance server management
4. **UI/UX improvements** - Better user experience
5. **Additional integrations** - More service connections

## 📞 Getting Help

- 📖 Check the [README](README.md) first
- 🔍 Search existing issues
- 💬 Ask questions in new issues
- 📧 Contact: [Open an issue](https://github.com/ThisDudeBoy/discord-bot-template-advanced/issues)

## 🙏 Recognition

Contributors will be recognized in:
- 📋 Contributors section of README
- 🏆 Special role in our Discord ([coming soon](https://discord.gg/q6T3bX2ZFG))
- 📝 Release notes for significant contributions

---

**Thank you for helping make this Discord bot template better! 🚀**

*Created with ❤️ by [AlexM](https://github.com/ThisDudeBoy)*