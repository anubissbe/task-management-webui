// Patch for project controller
const fs = require('fs');

// Read the controller
const controllerPath = '/app/dist/controllers/projectController.js';
let content = fs.readFileSync(controllerPath, 'utf8');

// Add userId extraction and enhanced data
const createProjectFix = `async function createProject(req, res) {
    try {
        const { workspace } = req;
        const userId = req.user?.id || req.user?.userId || req.userId || null;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Ensure all required fields
        const projectData = {
            ...req.body,
            workspace_id: workspace.id,
            owner_id: userId,
            created_by: userId,
            userId: userId,
            // Set defaults for missing fields
            requirements: req.body.requirements || '',
            acceptance_criteria: req.body.acceptance_criteria || '',
            status: req.body.status || 'planning',
            priority: req.body.priority || 'medium'
        };
        
        const project = await projectService.createProject(projectData);
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
}`;

// Replace the createProject function
const regex = /async function createProject\(req, res\) \{[\s\S]*?\n\}/;
if (content.match(regex)) {
    content = content.replace(regex, createProjectFix);
    fs.writeFileSync(controllerPath, content);
    console.log('Successfully patched projectController.js');
} else {
    console.log('Could not find createProject function to patch');
}

// Also ensure the service file uses a valid default user ID if needed
const servicePath = '/app/dist/services/projectService.js';
let serviceContent = fs.readFileSync(servicePath, 'utf8');

// Fix the VALUES clause counting issue
serviceContent = serviceContent.replace(
    /VALUES \(\$1, \$2, \$3, \$4, 'planning', \$5\)/,
    "VALUES ($1, $2, $3 || '', $4 || '', 'planning', $5)"
);

fs.writeFileSync(servicePath, serviceContent);
console.log('Fixed service file');