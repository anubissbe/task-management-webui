#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helper function to sanitize user input for logging
function sanitizeForLog(str) {
    if (typeof str !== 'string') {
        return JSON.stringify(str).replace(/[\r\n]/g, ' ');
    }
    return str.replace(/[\r\n]/g, ' ');
}

// Fix 1: Update backend.js to prevent log injection
function fixBackendLogInjection() {
    const backendPath = path.join(__dirname, 'new-frontend', 'backend.js');
    let content = fs.readFileSync(backendPath, 'utf8');
    
    // Replace all console.log statements that include req.body or req.params
    const replacements = [
        // Fix webhook logs
        {
            old: "console.log('✅ Webhooks POST - creating new webhook:', req.body);",
            new: "console.log('✅ Webhooks POST - creating new webhook');"
        },
        {
            old: "console.log(`✅ Webhooks PUT - updating webhook ${req.params.id}:`, req.body);",
            new: "console.log(`✅ Webhooks PUT - updating webhook ${sanitizeForLog(req.params.id)}`);"
        },
        {
            old: "console.log(`✅ Webhooks PATCH - updating webhook ${req.params.id}:`, req.body);",
            new: "console.log(`✅ Webhooks PATCH - updating webhook ${sanitizeForLog(req.params.id)}`);"
        },
        {
            old: "console.log(`✅ Webhooks DELETE - deleting webhook ${req.params.id}`);",
            new: "console.log(`✅ Webhooks DELETE - deleting webhook ${sanitizeForLog(req.params.id)}`);"
        },
        {
            old: "console.log(`✅ Webhooks TEST - testing webhook ${req.params.id}`);",
            new: "console.log(`✅ Webhooks TEST - testing webhook ${sanitizeForLog(req.params.id)}`);"
        },
        // Fix task logs
        {
            old: "console.log(`✅ Tasks PUT - updating task ${req.params.taskId}:`, req.body);",
            new: "console.log(`✅ Tasks PUT - updating task ${sanitizeForLog(req.params.taskId)}`);"
        },
        {
            old: "console.log(`✅ Tasks PATCH - updating task ${req.params.taskId}:`, req.body);",
            new: "console.log(`✅ Tasks PATCH - updating task ${sanitizeForLog(req.params.taskId)}`);"
        },
        {
            old: "console.log(`✅ Tasks DELETE - deleting task ${req.params.taskId}`);",
            new: "console.log(`✅ Tasks DELETE - deleting task ${sanitizeForLog(req.params.taskId)}`);"
        },
        {
            old: "console.log(`⚠️ Unhandled route: ${req.method} ${req.path}`);",
            new: "console.log(`⚠️ Unhandled route: ${sanitizeForLog(req.method)} ${sanitizeForLog(req.path)}`);"
        }
    ];
    
    // Add sanitizeForLog function at the top of the file
    const sanitizeFunctionDef = `
// Helper function to sanitize user input for logging
function sanitizeForLog(str) {
    if (typeof str !== 'string') {
        return JSON.stringify(str).replace(/[\\r\\n]/g, ' ');
    }
    return str.replace(/[\\r\\n]/g, ' ');
}
`;
    
    // Add function after imports if not already present
    if (!content.includes('function sanitizeForLog')) {
        const corsIndex = content.indexOf("const cors = require('cors');");
        const insertIndex = content.indexOf('\n', corsIndex) + 1;
        content = content.slice(0, insertIndex) + sanitizeFunctionDef + content.slice(insertIndex);
    }
    
    // Apply all replacements
    replacements.forEach((replacement) => {
        content = content.replace(replacement.old, replacement.new);
    });
    
    // Fix format string issues
    content = content.replace(
        /console\.log\(`([^`]*)\$\{([^}]+)\}([^`]*)`\)/g,
        (match, before, variable, after) => {
            if (variable.includes('req.')) {
                return `console.log(\`${before}\${sanitizeForLog(${variable})}${after}\`)`;
            }
            return match;
        }
    );
    
    fs.writeFileSync(backendPath, content);
    console.log('✅ Fixed log injection vulnerabilities in backend.js');
}

// Fix 2: Remove unused variables
function fixUnusedVariables() {
    // Fix fix-backend.js
    const fixBackendPath = path.join(__dirname, 'fix-backend.js');
    if (fs.existsSync(fixBackendPath)) {
        let content = fs.readFileSync(fixBackendPath, 'utf8');
        // Remove unused imports and variables
        content = content.replace(/const fixedNotificationService[^;]*;?\n?/g, '');
        content = content.replace(/const fixedCreateProject[^;]*;?\n?/g, '');
        content = content.replace(/const fs = require\('fs'\);?\n?/g, '');
        fs.writeFileSync(fixBackendPath, content);
        console.log('✅ Removed unused variables from fix-backend.js');
    }
    
    // Fix verify-no-errors.js
    const verifyPath = path.join(__dirname, 'new-frontend', 'verify-no-errors.js');
    if (fs.existsSync(verifyPath)) {
        let content = fs.readFileSync(verifyPath, 'utf8');
        content = content.replace(/const http = require\('http'\);?\n?/g, '');
        fs.writeFileSync(verifyPath, content);
        console.log('✅ Removed unused http import from verify-no-errors.js');
    }
}

// Fix 3: Remove or secure temporary development files
function removeDevFiles() {
    const filesToRemove = [
        'syntax-error-fix.js',
        'final-fix.js',
        'analyze-frontend.js',
        'final-auth-fix.js',
        'fix-backend.js',
        'controller-patch.js'
    ];
    
    filesToRemove.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Removed development file: ${file}`);
        }
    });
}

// Fix 4: Fix TypeScript files with security issues
function fixTypeScriptIssues() {
    // Fix log injection in TypeScript files
    const tsFiles = [
        'backend/src/services/webhookService.ts',
        'backend/src/services/reportService.ts',
        'backend/src/controllers/taskController.ts',
        'backend/src/controllers/projectController.ts'
    ];
    
    tsFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Add sanitize function if not present
            if (!content.includes('sanitizeForLog')) {
                const sanitizeFn = `
function sanitizeForLog(str: any): string {
    if (typeof str !== 'string') {
        return JSON.stringify(str).replace(/[\\r\\n]/g, ' ');
    }
    return str.replace(/[\\r\\n]/g, ' ');
}
`;
                content = sanitizeFn + '\n' + content;
            }
            
            // Fix console.log statements
            content = content.replace(
                /console\.(log|error|warn)\(`([^`]*)\$\{([^}]+)\}([^`]*)`\)/g,
                (match, method, before, variable, after) => {
                    if (variable.includes('req.') || variable.includes('params') || variable.includes('body')) {
                        return `console.${method}(\`${before}\${sanitizeForLog(${variable})}${after}\`)`;
                    }
                    return match;
                }
            );
            
            fs.writeFileSync(filePath, content);
            console.log(`✅ Fixed log injection in ${file}`);
        }
    });
}

// Main execution
console.log('🔒 Starting security fixes...\n');

fixBackendLogInjection();
fixUnusedVariables();
fixTypeScriptIssues();
removeDevFiles();

console.log('\n✅ All security fixes completed!');
console.log('📝 Note: Some files were removed as they were development/debugging scripts.');
console.log('🔄 Please commit these changes and push to trigger new security scans.');