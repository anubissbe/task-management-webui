import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Users, 
  Settings, 
  Trash2, 
  UserPlus, 
  Shield,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { workspaceService } from '../services/workspaceService';
import InviteTeamMemberModal from '../components/InviteTeamMemberModal';
import toast from 'react-hot-toast';

export function WorkspaceSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [invitationCopied, setInvitationCopied] = useState<string | null>(null);

  // Fetch workspace details
  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceService.getWorkspaceById(id!),
    enabled: !!id,
  });

  // Fetch workspace members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['workspace-members', id],
    queryFn: () => workspaceService.getWorkspaceMembers(id!),
    enabled: !!id,
  });

  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: (data: { name: string }) => 
      workspaceService.updateWorkspace(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', id] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setEditingName(false);
      toast.success('Workspace updated successfully');
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => 
      workspaceService.removeMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', id] });
      toast.success('Member removed successfully');
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'member' }) =>
      workspaceService.updateMemberRole(id!, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', id] });
      toast.success('Role updated successfully');
    },
  });

  const handleSaveName = () => {
    if (workspaceName.trim() && workspaceName !== workspace?.name) {
      updateWorkspaceMutation.mutate({ name: workspaceName });
    } else {
      setEditingName(false);
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setInvitationCopied(token);
    setTimeout(() => setInvitationCopied(null), 2000);
    toast.success('Invitation link copied!');
  };

  if (workspaceLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!workspace) {
    return <div>Workspace not found</div>;
  }

  const currentUserMember = members.find(m => m.user_id === localStorage.getItem('user_id'));
  const isOwnerOrAdmin = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <Building2 className="h-8 w-8 mr-3 text-blue-600" />
          Workspace Settings
        </h1>
      </div>

      {/* Workspace Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-gray-600" />
          General Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Workspace Name
            </label>
            {editingName && isOwnerOrAdmin ? (
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  onClick={handleSaveName}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <p className="text-lg font-medium">{workspace.name}</p>
                {isOwnerOrAdmin && (
                  <button
                    onClick={() => {
                      setWorkspaceName(workspace.name);
                      setEditingName(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Subscription Tier
            </label>
            <p className="mt-1 capitalize">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {workspace.subscription_tier}
              </span>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Created
            </label>
            <p className="mt-1">{new Date(workspace.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2 text-gray-600" />
            Members ({members.length})
          </h2>
          {isOwnerOrAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                  {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {member.user?.firstName} {member.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Shield className={`h-4 w-4 ${
                    member.role === 'owner' ? 'text-purple-600' :
                    member.role === 'admin' ? 'text-blue-600' :
                    'text-gray-600'
                  }`} />
                  {isOwnerOrAdmin && member.role !== 'owner' ? (
                    <select
                      value={member.role}
                      onChange={(e) => updateRoleMutation.mutate({
                        userId: member.user_id,
                        role: e.target.value as 'admin' | 'member'
                      })}
                      className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  ) : (
                    <span className="text-sm capitalize">{member.role}</span>
                  )}
                </div>

                {isOwnerOrAdmin && member.role !== 'owner' && member.user_id !== currentUserMember?.user_id && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to remove this member?')) {
                        removeMemberMutation.mutate(member.user_id);
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteTeamMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={async (email, role) => {
            await workspaceService.inviteMember(id!, { email, role });
            queryClient.invalidateQueries({ queryKey: ['workspace-members', id] });
            setShowInviteModal(false);
            toast.success('Invitation sent successfully');
          }}
          teamName={workspace.name}
          isWorkspace={true}
        />
      )}
    </div>
  );
}