import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspaceController';
import { authenticate } from '../middleware/auth';
import { workspaceContext, requireWorkspaceAdmin } from '../middleware/workspace';

const router = Router();

// All workspace routes require authentication
router.use(authenticate);

// Workspace management routes
router.get('/', WorkspaceController.getUserWorkspaces);
router.post('/', WorkspaceController.createWorkspace);
router.get('/:id', WorkspaceController.getWorkspaceById);
router.put('/:id', WorkspaceController.updateWorkspace);
router.delete('/:id', WorkspaceController.deleteWorkspace);

// Workspace statistics
router.get('/:id/stats', WorkspaceController.getWorkspaceStats);

// Switch current workspace
router.post('/:id/switch', WorkspaceController.switchWorkspace);

// Member management routes (require workspace context)
router.get('/:id/members', WorkspaceController.getWorkspaceMembers);
router.post('/:workspaceId/invite', workspaceContext, WorkspaceController.inviteMember);
router.put('/:workspaceId/members/:userId/role', workspaceContext, requireWorkspaceAdmin, WorkspaceController.updateMemberRole);
router.delete('/:workspaceId/members/:userId', workspaceContext, requireWorkspaceAdmin, WorkspaceController.removeMember);

// Accept invitation (no workspace context needed)
router.post('/invitations/:token/accept', WorkspaceController.acceptInvitation);

export default router;