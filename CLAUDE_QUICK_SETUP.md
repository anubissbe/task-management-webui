# 🚀 Quick Setup: ProjectHub + Claude Code

Get ProjectHub working with Claude Code in under 2 minutes!

## 1. Start ProjectHub (30 seconds)

```bash
# Clone and start
git clone https://github.com/anubissbe/ProjectHub-Mcp.git
cd ProjectHub-Mcp
docker-compose up -d

# Verify it's running
curl http://localhost:3009/health
```

## 2. Add to Your Project (30 seconds)

Create `CLAUDE.md` in your project root:

```markdown
# CLAUDE.md - ProjectHub Integration

This project uses ProjectHub for task tracking.

## ProjectHub Connection
- API: http://localhost:3009/api
- Login: admin@projecthub.com / admin123

## When working on this project:
1. Create a project in ProjectHub when starting new features
2. Break work into 1-4 hour tasks
3. Update task status as you progress
4. Mark tasks complete when done

## Quick Commands
- "Create a project for [feature name]"
- "Update task [ID] to in_progress"
- "Show my current tasks"
- "Mark task [ID] as completed"
```

## 3. Test It Works (1 minute)

Ask Claude Code:
> "Create a ProjectHub project for implementing user authentication"

Claude will:
1. Connect to ProjectHub
2. Create the project
3. Break it into tasks
4. Show you the project ID

## 4. Daily Workflow

### Starting Work
```
You: "What are my open tasks in ProjectHub?"
Claude: *fetches and shows your tasks*
```

### During Work
```
You: "I'm starting work on task 123"
Claude: *updates task to in_progress*
```

### Completing Work
```
You: "Task 123 is done, took 3 hours"
Claude: *marks complete with time tracking*
```

## 📍 Pro Tips

### Auto-Track Everything
Add this to CLAUDE.md:
```markdown
## Auto-Tracking Rules
- Automatically create tasks for TODO comments
- Update status when files are modified
- Track time between status changes
- Link commits to tasks
```

### Quick Status Check
```
You: "Show ProjectHub analytics"
Claude: *displays your productivity metrics*
```

### Bulk Operations
```
You: "Mark all testing tasks as completed"
Claude: *updates multiple tasks at once*
```

## 🔧 Troubleshooting

**Can't connect?**
```bash
# Check if ProjectHub is running
docker ps | grep projecthub

# Check API health
curl http://localhost:3009/health
```

**Wrong port?**
- Frontend runs on port 5174
- API runs on port 3009 (use this one!)

**Authentication failed?**
- Default login: admin@projecthub.com / admin123
- Token expires after 24 hours

## 🎯 Example Session

```
You: Help me implement a shopping cart feature

Claude: I'll create a project in ProjectHub to track this implementation.

Creating project... ✓
Created project: "Shopping Cart Feature" (ID: 123)

Breaking down into tasks:
1. Design cart data model (2h) - ID: 456
2. Create cart API endpoints (3h) - ID: 457  
3. Build cart UI component (3h) - ID: 458
4. Add cart persistence (2h) - ID: 459
5. Write tests (2h) - ID: 460

I'll update these tasks as we progress. Let's start with the data model...
```

## 🔗 More Resources

- [Full AI Integration Guide](./docs/AI_INTEGRATION_GUIDE.md)
- [API Documentation](./docs/API.md)
- [ProjectHub Wiki](https://github.com/anubissbe/ProjectHub-Mcp/wiki)

---

**That's it!** You're now tracking all your development work automatically with ProjectHub + Claude Code 🎉