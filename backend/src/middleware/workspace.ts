import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from '../services/workspaceService';

/**
 * Middleware to extract and validate workspace context from requests
 * Workspace can be specified via:
 * 1. Header: X-Workspace-Id
 * 2. Query parameter: workspace_id
 * 3. URL parameter: :workspaceId
 * 4. User's current workspace from session
 */
export async function workspaceContext(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let workspaceId: string | undefined;

    // Priority 1: Check header
    const headerWorkspaceId = req.headers['x-workspace-id'] as string;
    if (headerWorkspaceId) {
      workspaceId = headerWorkspaceId;
    }

    // Priority 2: Check query parameter
    if (!workspaceId && req.query.workspace_id) {
      workspaceId = req.query.workspace_id as string;
    }

    // Priority 3: Check URL parameter
    if (!workspaceId && req.params.workspaceId) {
      workspaceId = req.params.workspaceId;
    }

    // Priority 4: Use user's current workspace
    if (!workspaceId && req.user.workspace_id) {
      workspaceId = req.user.workspace_id;
    }

    // If no workspace specified, get user's first workspace
    if (!workspaceId) {
      const userWorkspaces = await WorkspaceService.getUserWorkspaces(req.user.id);
      if (userWorkspaces.length > 0) {
        workspaceId = userWorkspaces[0].id;
      }
    }

    if (!workspaceId) {
      return res.status(400).json({ 
        error: 'No workspace context found',
        code: 'WORKSPACE_REQUIRED' 
      });
    }

    // Verify user has access to the workspace
    const hasAccess = await WorkspaceService.checkWorkspaceAccess(req.user.id, workspaceId);
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied to workspace',
        code: 'WORKSPACE_ACCESS_DENIED' 
      });
    }

    // Set workspace ID on request
    req.workspaceId = workspaceId;
    next();
  } catch (error) {
    console.error('Workspace context error:', error);
    res.status(500).json({ 
      error: 'Failed to establish workspace context',
      code: 'WORKSPACE_CONTEXT_ERROR' 
    });
  }
}

/**
 * Middleware to require workspace admin permissions
 */
export async function requireWorkspaceAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.workspaceId) {
      return res.status(401).json({ error: 'Authentication and workspace context required' });
    }

    const member = await WorkspaceService.getWorkspaceMember(req.workspaceId, req.user.id);
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ 
        error: 'Workspace admin permissions required',
        code: 'INSUFFICIENT_WORKSPACE_PERMISSIONS' 
      });
    }

    next();
  } catch (error) {
    console.error('Workspace admin check error:', error);
    res.status(500).json({ error: 'Failed to verify workspace permissions' });
  }
}

/**
 * Middleware to require workspace owner permissions
 */
export async function requireWorkspaceOwner(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.workspaceId) {
      return res.status(401).json({ error: 'Authentication and workspace context required' });
    }

    const member = await WorkspaceService.getWorkspaceMember(req.workspaceId, req.user.id);
    if (!member || member.role !== 'owner') {
      return res.status(403).json({ 
        error: 'Workspace owner permissions required',
        code: 'OWNER_ONLY' 
      });
    }

    next();
  } catch (error) {
    console.error('Workspace owner check error:', error);
    res.status(500).json({ error: 'Failed to verify workspace ownership' });
  }
}