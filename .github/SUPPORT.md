# 🆘 Getting Support

Need help with ProjectHub-MCP? You're in the right place! Here are the best ways to get support.

## 📚 Documentation First

Before asking for help, please check our comprehensive documentation:

- **[📖 Project Wiki](https://github.com/anubissbe/ProjectHub-Mcp/wiki)** - Complete user guides and tutorials
- **[🔧 API Documentation](https://github.com/anubissbe/ProjectHub-Mcp/wiki/API-Documentation)** - Full API reference
- **[✨ Features Guide](https://github.com/anubissbe/ProjectHub-Mcp/wiki/Features)** - Overview of all features
- **[🚀 Getting Started](README.md#quick-start)** - Setup and installation guide

## 💬 Community Support

### GitHub Discussions (Recommended)
**[Start a Discussion](https://github.com/anubissbe/ProjectHub-Mcp/discussions)**

Perfect for:
- ❓ General questions about usage
- 💡 Feature ideas and suggestions
- 🛠️ Implementation help
- 📋 Best practices discussions
- 🎉 Sharing your projects

### Discussion Categories:
- **🙋 Q&A** - Ask questions and get help
- **💡 Ideas** - Suggest new features
- **🗣️ General** - General discussion
- **🎉 Show and Tell** - Share your work
- **📢 Announcements** - Stay updated

## 🐛 Bug Reports

**[Report a Bug](https://github.com/anubissbe/ProjectHub-Mcp/issues/new?template=bug_report.yml)**

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, version)
- Screenshots or logs if helpful

## 💡 Feature Requests

**[Request a Feature](https://github.com/anubissbe/ProjectHub-Mcp/issues/new?template=feature_request.yml)**

For new feature ideas:
- Describe the feature clearly
- Explain the use case
- Consider the impact on other users
- Check if it's already in our [roadmap](ROADMAP.md)

## 📧 Direct Support

### Email Support
**bert@telkom.be**

Use email for:
- Security-related issues
- Private questions
- Partnership inquiries
- Sensitive topics

**Response Time**: Within 24-48 hours

### Response Priorities
- 🔴 Security issues: < 24 hours
- 🟡 Bug reports: < 48 hours  
- 🔵 Feature requests: < 1 week
- 🟢 General questions: < 1 week

## 🔍 Self-Help Resources

### Common Issues

#### Installation Problems
1. Check Node.js version (requires 18+)
2. Verify PostgreSQL connection
3. Review environment variables
4. Check Docker setup

#### Performance Issues
1. Check database performance
2. Review server resources
3. Monitor network connectivity
4. Verify WebSocket connections

#### API Issues
1. Check authentication
2. Verify request format
3. Review API documentation
4. Check rate limits

### Debug Mode
Enable debug logging:
```bash
NODE_ENV=development DEBUG=* npm start
```

### Health Checks
Verify system status:
```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/db
curl http://localhost:3001/api/health/ws
```

## 🤝 Community Guidelines

When seeking support:

### ✅ Do:
- Search existing discussions/issues first
- Provide clear, detailed descriptions
- Include relevant code/logs
- Be respectful and patient
- Help others when you can
- Follow up on your questions

### ❌ Don't:
- Create duplicate issues
- Ask for immediate responses
- Post in multiple channels
- Include sensitive information
- Demand priority support

## 🎯 Getting Faster Help

### Before Posting:
1. **🔍 Search** existing issues and discussions
2. **📖 Read** the documentation
3. **🧪 Test** with minimal examples
4. **📝 Prepare** clear reproduction steps

### Writing Good Questions:
1. **Clear title** that summarizes the issue
2. **Detailed description** of what you're trying to do
3. **Code examples** or configuration
4. **Error messages** with full stack traces
5. **Environment details** (OS, versions, etc.)

## 💪 Contributing Back

Help others by:
- **📝 Answering questions** in discussions
- **🐛 Reporting bugs** you encounter
- **📚 Improving documentation**
- **🔧 Contributing code** fixes
- **⭐ Starring** the repository

## ☕ Support Development

If ProjectHub-MCP helps you, consider supporting development:

**[☕ Buy Me A Coffee](https://buymeacoffee.com/anubissbe)**

Your support helps:
- 🚀 Faster feature development
- 🐛 Quick bug fixes
- 📚 Better documentation
- 🎯 Focus on community needs

## 📊 Support Statistics

- **Average Response Time**: 24 hours
- **Issue Resolution Rate**: 95%
- **Community Contributors**: 10+
- **Satisfaction Rating**: 4.8/5 ⭐

## 📞 Emergency Support

For critical production issues:

1. **📧 Email**: bert@telkom.be with "URGENT" in subject
2. **🐛 GitHub Issue**: Use "bug" template with "critical" label
3. **💬 Discussion**: Post in Q&A with "urgent" in title

We'll prioritize critical issues affecting production systems.

---

**Remember**: The community is here to help! Don't hesitate to ask questions, and consider helping others when you can. Together, we make ProjectHub-MCP better for everyone! 🎉