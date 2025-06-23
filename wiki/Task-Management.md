# Task Management

This guide covers all aspects of task management within ProjectHub-MCP v4.5.1, including creating, organizing, tracking, and completing tasks effectively in this enterprise-grade project management system.

## 🆕 Creating Tasks

### Quick Task Creation
The fastest way to create a task:

1. **From Any View**: Click the **"New Task"** button
2. **Keyboard Shortcut**: Press `N` anywhere in the application
3. **From Board**: Click the **"+"** button in any status column

### Task Creation Form

**Required Fields**:
- **Title**: Clear, actionable task name
- **Project**: Select the target project

**Optional Fields**:
- **Description**: Detailed task information with markdown support
- **Status**: Pending (default), In Progress, Blocked, Testing, Completed
- **Priority**: Low, Medium (default), High, Critical
- **Assignee**: Team member responsible for the task
- **Due Date**: Target completion date
- **Estimated Hours**: Time estimate for completion
- **Tags**: Custom labels for categorization
- **Dependencies**: Tasks that must be completed first

### Bulk Task Creation
Create multiple tasks at once:

1. Click **"New Task"** → **"Bulk Create"**
2. Use templates or paste a list of task names
3. Set common properties (project, assignee, priority)
4. Click **"Create All"**

## 📝 Task Details and Editing

### Task Detail View
Click any task to open the detailed view with:

**Header Information**:
- Editable title
- Status dropdown
- Priority selector
- Assignee picker
- Due date calendar

**Description Section**:
- Rich text editor with markdown support
- Formatting options: **bold**, *italic*, `code`, lists, links
- Real-time preview

**Metadata**:
- Created date and author
- Last modified date and user
- Time tracking information
- Task ID for reference

### Quick Editing
**Inline Editing** (List View):
- Double-click any field to edit in place
- Tab to move between fields
- Enter to save, Escape to cancel

**Status Quick Change**:
- Drag tasks between columns (Board View)
- Right-click → Change Status
- Keyboard shortcuts in task detail

## 🏷️ Task Organization

### Status Management

**Pending** (Gray)
- Newly created tasks
- Waiting for dependencies
- Scheduled for future work

**In Progress** (Blue)
- Currently being worked on
- Active development/implementation
- Should have assignee and time tracking

**Blocked** (Red)
- Cannot proceed due to external factors
- Waiting for information/resources
- Dependency issues

**Testing** (Yellow)
- Code review phase
- Quality assurance testing
- User acceptance testing

**Completed** (Green)
- Successfully finished
- Meets acceptance criteria
- Ready for deployment/delivery

### Priority System

**Critical** (🔴 Red Triangle)
- Production issues
- Security vulnerabilities
- Blocking other team members
- Must be addressed immediately

**High** (🟠 Orange Exclamation)
- Important features
- Customer-requested items
- Deadline-sensitive work
- Should be completed this sprint

**Medium** (🔵 Blue Dot)
- Standard work items
- Planned features
- General improvements
- Default priority level

**Low** (No Indicator)
- Nice-to-have features
- Technical debt
- Future enhancements
- Can be deferred if needed

### Tagging System

**Common Tag Categories**:
- **Type**: `feature`, `bug`, `enhancement`, `documentation`
- **Component**: `frontend`, `backend`, `database`, `api`
- **Complexity**: `easy`, `medium`, `hard`, `epic`
- **Team**: `design`, `development`, `qa`, `devops`

**Best Practices**:
- Use consistent tag naming conventions
- Limit to 3-5 tags per task
- Create tag hierarchies for better organization
- Regular tag cleanup and consolidation

## ⏱️ Time Tracking

### Time Estimation
**Setting Estimates**:
- Use consistent units (hours or story points)
- Break down large tasks into smaller estimates
- Include buffer time for complexity
- Update estimates as you learn more

**Estimation Techniques**:
- **T-shirt sizing**: Small (1-4h), Medium (4-8h), Large (8-16h)
- **Fibonacci**: 1, 2, 3, 5, 8, 13, 21 hours
- **Planning poker**: Team-based estimation

### Time Logging
**Manual Time Entry**:
1. Open task detail view
2. Click **"Log Time"** button
3. Enter hours worked and description
4. Save the entry

**Timer Integration**:
1. Click **"Start Timer"** on any task
2. Work on the task
3. Click **"Stop Timer"** when done
4. Add description and save

**Time Reports**:
- View logged time per task
- Generate weekly/monthly reports
- Track actual vs. estimated time
- Export time data for billing

## 🔗 Task Dependencies

### Dependency Types

**Finish-to-Start** (Most Common)
- Task A must complete before Task B can start
- Example: "Design approval" → "Development"

**Start-to-Start**
- Task A must start before Task B can start
- Example: "Research" → "Documentation"

**Finish-to-Finish**
- Task A must finish before Task B can finish
- Example: "Development" → "Testing"

### Managing Dependencies

**Adding Dependencies**:
1. Open task detail view
2. Click **"Dependencies"** section
3. Search and select prerequisite tasks
4. Save changes

**Dependency Visualization**:
- **Board View**: Dependency indicators on cards
- **Timeline View**: Connecting lines between tasks
- **List View**: Dependency column with linked tasks

**Handling Blocked Tasks**:
- Automatically mark tasks as blocked when dependencies are incomplete
- Show dependency chain in task details
- Notify assignees when blocking tasks are completed

## 💬 Comments and Collaboration

### Adding Comments
1. Open task detail view
2. Scroll to **"Comments"** section
3. Type your comment (markdown supported)
4. Mention users with `@username`
5. Click **"Add Comment"**

### Comment Features
- **Rich Text**: Markdown formatting support
- **Mentions**: Notify team members with @mentions
- **Attachments**: Add files, images, or links
- **Threading**: Reply to specific comments
- **History**: View edit history for comments

### Notifications
**You'll be notified when**:
- You're mentioned in a comment
- Tasks assigned to you are updated
- Dependencies you're waiting for are completed
- Due dates are approaching

## 📎 Attachments and Files

### Supported File Types
- **Images**: PNG, JPG, GIF, SVG (with preview)
- **Documents**: PDF, DOC, DOCX, TXT
- **Code**: JS, TS, JSON, CSS, HTML
- **Archives**: ZIP, TAR, GZ
- **Others**: Any file type up to 10MB

### Adding Attachments
1. Open task detail view
2. Click **"Attachments"** section
3. Drag and drop files or click **"Upload"**
4. Add optional description
5. Files are automatically saved

### Attachment Management
- **Preview**: Click to preview supported files
- **Download**: Download files to your device
- **Delete**: Remove attachments (with confirmation)
- **Version Control**: Keep track of file updates

## 🔍 Task Search and Filtering

### Global Search
**Search Capabilities**:
- Task titles and descriptions
- Comments and notes
- Tag names
- Assignee names
- File attachments

**Search Tips**:
- Use quotes for exact phrases: `"bug fix"`
- Search by assignee: `assignee:john`
- Search by status: `status:completed`
- Search by tag: `tag:frontend`
- Combine terms: `bug priority:high assignee:jane`

### Advanced Filtering

**Filter Panel** (accessible via **"Filters"** button):

**Status Filters**:
- Select one or multiple statuses
- Exclude specific statuses
- Custom status combinations

**Date Filters**:
- **Created**: When the task was created
- **Due Date**: When the task is due
- **Updated**: When the task was last modified
- **Completed**: When the task was finished

**Assignment Filters**:
- **Assigned to me**: Tasks you're responsible for
- **Unassigned**: Tasks without an assignee
- **Specific user**: Tasks assigned to team members
- **Multiple users**: Tasks assigned to any of selected users

**Tag Filters**:
- Include tasks with specific tags
- Exclude tasks with certain tags
- Multiple tag combinations (AND/OR logic)

### Saved Filters
**Creating Saved Filters**:
1. Apply your desired filters
2. Click **"Save Filter"**
3. Give it a descriptive name
4. Choose visibility (personal or team)

**Common Saved Filters**:
- "My Active Tasks": `assignee:me status:pending,in_progress`
- "Overdue Items": `due:<today status:!completed`
- "High Priority Bugs": `tag:bug priority:high,critical`
- "This Week's Work": `due:this_week assignee:me`

## 📊 Task Analytics

### Personal Productivity
- **Completion Rate**: Percentage of tasks finished on time
- **Average Completion Time**: How long tasks typically take
- **Workload Distribution**: Tasks by status and priority
- **Time Tracking Accuracy**: Estimated vs. actual time

### Team Performance
- **Team Velocity**: Tasks completed per sprint/week
- **Bottleneck Analysis**: Where tasks get stuck
- **Collaboration Metrics**: Comments, mentions, handoffs
- **Quality Metrics**: Re-opened tasks, bug rates

## ✅ Best Practices

### Task Creation
- **Be Specific**: Write clear, actionable task titles
- **Size Appropriately**: Break large tasks into smaller ones
- **Include Context**: Add enough detail for anyone to understand
- **Set Realistic Estimates**: Account for complexity and interruptions

### Task Management
- **Regular Updates**: Update status and progress frequently
- **Log Time Consistently**: Track actual time spent
- **Use Comments**: Communicate progress and blockers
- **Clean Dependencies**: Remove outdated or unnecessary dependencies

### Team Collaboration
- **Assign Clearly**: Every task should have a clear owner
- **Communicate Blockers**: Report issues early and clearly
- **Share Context**: Include relevant links, files, and background
- **Review Regularly**: Conduct task reviews in team meetings

### Workflow Optimization
- **Limit Work in Progress**: Don't start too many tasks at once
- **Prioritize Ruthlessly**: Focus on high-impact, urgent tasks
- **Batch Similar Tasks**: Group similar work together
- **Regular Grooming**: Clean up old, outdated, or duplicate tasks

---

**Next**: Learn about [Project Management](Project-Management) workflows and strategies.