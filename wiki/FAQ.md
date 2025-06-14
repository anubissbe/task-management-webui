# Frequently Asked Questions (FAQ)

This FAQ covers common questions about the Task Management WebUI, including setup, usage, troubleshooting, and best practices.

## 🚀 Getting Started

### Q: What are the system requirements?
**A:** Minimum requirements:
- **Development**: Node.js 18+, Docker, 4GB RAM, 2GB disk space
- **Production**: 2 CPU cores, 4GB RAM, 10GB disk space, Docker support
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Q: How do I install the application?
**A:** The quickest way is using our pre-built release:
```bash
curl -L https://github.com/anubissbe/task-management-webui/releases/download/v1.0.0/task-management-webui-v1.0.0-full.tar.gz | tar -xz
docker compose up -d
```
See the [Installation Guide](Installation-Guide) for detailed instructions.

### Q: Can I run this without Docker?
**A:** Yes, but Docker is strongly recommended. For manual setup:
1. Install PostgreSQL 15+ with pgvector extension
2. Install Node.js 18+
3. Configure environment variables
4. Run `npm install` and `npm start` in both frontend and backend directories

### Q: Is there a demo available?
**A:** Yes! After installation, access the application at `http://localhost:5173`. Sample projects and tasks are automatically created for demonstration.

## 👥 User Management

### Q: How do I create user accounts?
**A:** Currently, the application runs in single-user mode for simplicity. Multi-user authentication is planned for future releases. You can track this feature request in our [GitHub Issues](https://github.com/anubissbe/task-management-webui/issues).

### Q: Can multiple people use the same instance?
**A:** Yes, multiple people can use the same instance simultaneously. Real-time updates ensure everyone sees changes instantly. However, there's no user-specific data separation currently.

### Q: How do I set user permissions?
**A:** Role-based access control is not implemented yet. This feature is planned for v2.0. Currently, all users have full access to all projects and tasks.

## 📊 Project Management

### Q: How many projects can I create?
**A:** There's no hard limit on projects. The system is designed to handle hundreds of projects efficiently. Performance depends on your hardware and database configuration.

### Q: Can I import projects from other tools?
**A:** Direct import tools aren't built-in yet, but you can:
1. Use the bulk create feature for tasks
2. Use the REST API to programmatically import data
3. Export from your current tool to CSV and manually import
4. Check our [Custom Integrations](Custom-Integrations) guide

### Q: How do I backup my projects?
**A:** Several backup options:
- **Database backup**: `docker exec task-management-postgres pg_dump -U mcp_user mcp_learning > backup.sql`
- **Export feature**: Use the built-in export to JSON/CSV
- **API backup**: Script using the REST API
- See [Backup & Recovery](Backup-Recovery) for details

### Q: Can I use custom project templates?
**A:** Yes! Create a project with your ideal structure, then go to Project Settings → "Save as Template". Your template will be available when creating new projects.

## 📋 Task Management

### Q: What's the maximum task description length?
**A:** Task descriptions support markdown and can be up to 10,000 characters. For longer content, consider using attachments.

### Q: How do task dependencies work?
**A:** Tasks can have prerequisites that must be completed first. Dependent tasks are automatically marked as "blocked" until their dependencies are resolved. Dependencies are visualized in the Timeline view.

### Q: Can I set recurring tasks?
**A:** Recurring tasks aren't built-in yet, but you can:
1. Create task templates for repeated work
2. Use the bulk create feature
3. Clone existing tasks
4. This feature is planned for v1.2

### Q: How do I bulk update tasks?
**A:** In List view:
1. Select multiple tasks using checkboxes
2. Click "Bulk Actions" 
3. Choose: change status, assignee, priority, or delete
4. Apply changes to all selected tasks

## ⏱️ Time Tracking

### Q: How accurate is the time tracking?
**A:** Time tracking accuracy depends on user discipline:
- **Manual logging**: As accurate as users make it
- **Timer feature**: Accurate to the second while running
- **Integration**: Can integrate with external time tracking tools via API

### Q: Can I edit logged time entries?
**A:** Yes, you can edit time entries in the task detail view. Click on any time entry to modify the hours, description, or date.

### Q: How do I generate time reports?
**A:** Time reports are available in the Analytics dashboard:
1. Go to Analytics → Time Analysis
2. Filter by date range, user, or project
3. Export to PDF, Excel, or CSV
4. View summaries by task, user, or time period

## 📈 Analytics and Reporting

### Q: What metrics are tracked?
**A:** Key metrics include:
- Task completion rates
- Team velocity and productivity
- Time estimates vs. actual time
- Project health and progress
- Quality metrics (defect rates)
- See [Analytics Dashboard](Analytics-Dashboard) for complete list

### Q: Can I create custom reports?
**A:** Yes! The report builder allows:
- Custom date ranges
- Multiple chart types
- Filtered data sets
- Scheduled email delivery
- Export in various formats

### Q: How far back does data history go?
**A:** All data is preserved indefinitely by default. You can:
- View historical trends for any time period
- Archive old projects to improve performance
- Configure data retention policies if needed

## 🔌 Integration and API

### Q: Is there a REST API?
**A:** Yes! Comprehensive REST API documentation is available:
- Full CRUD operations for projects and tasks
- Real-time WebSocket events
- Authentication ready (when implemented)
- See [API Documentation](API-Documentation) for details

### Q: Can I integrate with Slack/Teams?
**A:** Integration capabilities:
- **Webhooks**: Send notifications to any URL
- **API**: Build custom integrations
- **Zapier/IFTTT**: Use API with automation tools
- **Direct integrations**: Planned for future releases

### Q: How do I connect to external databases?
**A:** Currently supports PostgreSQL only. For other databases:
1. Use the API to sync data
2. Export/import via CSV/JSON
3. Create custom integration scripts
4. Multi-database support is being considered

## 🎨 Customization

### Q: Can I change the color scheme?
**A:** Yes! Built-in options:
- Light and dark themes
- System preference following
- Custom CSS overrides supported
- Brand customization via CSS variables

### Q: How do I add custom fields to tasks?
**A:** Custom fields aren't built-in, but you can:
- Use the description field with structured text
- Leverage the tags system for categorization
- Store additional data in comments
- Custom fields are planned for v1.3

### Q: Can I modify the workflow statuses?
**A:** Currently, statuses are fixed (Pending, In Progress, Blocked, Testing, Completed). Custom workflows are planned for v1.2. You can track this in our roadmap.

## 🐛 Troubleshooting

### Q: The application won't start. What should I check?
**A:** Common issues and solutions:
1. **Port conflicts**: Check if ports 3001, 5173, or 5432 are in use
2. **Docker issues**: Ensure Docker is running and has sufficient resources
3. **Database connection**: Verify PostgreSQL is accessible
4. **Environment variables**: Check `.env` file configuration
5. See [Troubleshooting Guide](Troubleshooting) for detailed steps

### Q: Tasks aren't loading or updating
**A:** Try these steps:
1. **Refresh browser**: Hard refresh with Ctrl+F5
2. **Check network**: Verify API connectivity at `http://localhost:3001/api/health`
3. **Database connection**: Check backend logs for database errors
4. **WebSocket issues**: Restart the backend service

### Q: Performance is slow with many tasks
**A:** Performance optimization:
1. **Database indexes**: Ensure proper indexing (automatic in our setup)
2. **Limit data**: Use filters to reduce displayed tasks
3. **Archive projects**: Move completed projects to archive
4. **Increase resources**: Add more RAM/CPU if using Docker

### Q: Dark mode text is not readable
**A:** This was a known issue that's been fixed in v1.0.0. If you're still experiencing issues:
1. Update to the latest version
2. Clear browser cache
3. Check for custom CSS overrides
4. Report specific contrast issues on GitHub

## 🔒 Security

### Q: Is my data secure?
**A:** Security measures in place:
- HTTPS encryption in production
- SQL injection protection
- XSS prevention
- CORS protection
- Rate limiting
- See [Security Configuration](Security-Configuration) for details

### Q: Where is data stored?
**A:** Data storage:
- **Database**: PostgreSQL (local or hosted)
- **Files**: Local filesystem or cloud storage
- **No external services**: All data stays within your infrastructure
- **Backups**: You control all backup locations

### Q: Can I run this on-premises?
**A:** Yes! The application is designed for on-premises deployment:
- No external dependencies required
- Full control over data and infrastructure
- Works in air-gapped environments
- See [Production Deployment](Production-Deployment) guide

## 🔄 Updates and Maintenance

### Q: How do I update to a new version?
**A:** Update process:
1. **Backup data**: Always backup before updating
2. **Pull updates**: `git pull origin main`
3. **Rebuild containers**: `docker compose up -d --build`
4. **Database migrations**: Run automatically on startup
5. **Test functionality**: Verify everything works correctly

### Q: What's the release schedule?
**A:** Release cadence:
- **Major releases**: Every 6 months (new features)
- **Minor releases**: Every 2 months (improvements)
- **Patch releases**: As needed (bug fixes)
- **Security updates**: Immediate (when required)

### Q: How do I migrate data between instances?
**A:** Data migration options:
1. **Database backup/restore**: Most complete method
2. **Export/Import**: Use built-in export features
3. **API transfer**: Script data transfer between instances
4. **File copy**: Copy Docker volumes (with caution)

## 🚀 Performance

### Q: How many concurrent users are supported?
**A:** Performance depends on hardware:
- **Small team (5-10 users)**: 2GB RAM, 1 CPU core
- **Medium team (25-50 users)**: 4GB RAM, 2 CPU cores
- **Large team (100+ users)**: 8GB+ RAM, 4+ CPU cores
- **Database tuning**: May be needed for very large datasets

### Q: Can I use a CDN for static assets?
**A:** Yes! For production:
1. Build frontend with `npm run build`
2. Serve static files from CDN
3. Update `VITE_API_URL` to point to your API
4. Configure CORS for CDN domain

### Q: How do I optimize database performance?
**A:** Database optimization:
1. **Regular maintenance**: Built-in automatic vacuuming
2. **Indexing**: Automatic for common queries
3. **Connection pooling**: Configured by default
4. **Monitoring**: Use `/api/health/detailed` endpoint
5. **Scaling**: Consider read replicas for large deployments

## 📞 Support and Community

### Q: Where can I get help?
**A:** Support resources:
- **Documentation**: This wiki and guides
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community Q&A on GitHub
- **Email**: Limited support via GitHub issues

### Q: How do I report bugs?
**A:** Bug reporting:
1. Check [existing issues](https://github.com/anubissbe/task-management-webui/issues)
2. Create new issue with:
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots/videos if applicable
   - System information (OS, browser, version)
3. Use appropriate labels and templates

### Q: Can I contribute to the project?
**A:** Absolutely! Contributions welcome:
- **Code**: Features, bug fixes, improvements
- **Documentation**: Wiki updates, guides, tutorials
- **Testing**: Bug reports, compatibility testing
- **Ideas**: Feature suggestions and feedback
- See [Contributing Guidelines](Contributing-Guidelines)

### Q: Is there a roadmap?
**A:** Yes! Check our roadmap:
- **GitHub Projects**: Current sprint and backlog
- **Milestones**: Planned releases with features
- **Issues**: Feature requests with voting
- **Discussions**: Community input on direction

## 💰 Licensing and Cost

### Q: Is this free to use?
**A:** Yes! The application is open source:
- **Free for all uses**: Commercial and personal
- **No licensing fees**: Ever
- **No user limits**: Scale as needed
- **Full source code**: Available on GitHub

### Q: Can I modify the code?
**A:** Yes! Under the open source license:
- Modify for your needs
- Distribute your changes
- Contribute back to the community
- Maintain compatibility with updates

### Q: Do you offer paid support?
**A:** Currently, support is community-based through GitHub. Paid support options may be available in the future for enterprise deployments.

---

**Still have questions?** Check the [Troubleshooting Guide](Troubleshooting) or create an issue on [GitHub](https://github.com/anubissbe/task-management-webui/issues).