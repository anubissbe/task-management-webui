import React, { useState } from 'react';
import { TeamMember } from '../services/teamService';

interface TeamMembersListProps {
  members: TeamMember[];
  currentUserId: string;
  currentUserRole: string;
  onUpdateRole: (userId: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({
  members,
  currentUserId,
  currentUserRole,
  onUpdateRole,
  onRemoveMember
}) => {
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const canManageRole = (memberRole: string): boolean => {
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'admin' && memberRole !== 'owner') return true;
    return false;
  };

  const canRemoveMember = (memberId: string, memberRole: string): boolean => {
    if (memberId === currentUserId) return false; // Can't remove yourself
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'admin' && memberRole !== 'owner') return true;
    return false;
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member' | 'viewer') => {
    const actionKey = `role-${userId}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      await onUpdateRole(userId, newRole);
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }

    const actionKey = `remove-${userId}`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    
    try {
      await onRemoveMember(userId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    const colors: Record<string, string> = {
      owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      member: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    };
    return colors[role] || colors.viewer;
  };

  const formatJoinDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (members.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0H21m-6.75-6h.75" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No team members found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Team Members ({members.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {members.map((member) => (
          <div key={member.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                {member.user?.avatar_url ? (
                  <img
                    src={member.user.avatar_url}
                    alt={`${member.user.first_name} ${member.user.last_name}`}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {member.user?.first_name?.charAt(0)}
                      {member.user?.last_name?.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.user?.first_name} {member.user?.last_name}
                      {member.user_id === currentUserId && (
                        <span className="text-gray-500 dark:text-gray-400"> (You)</span>
                      )}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.user?.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Joined {formatJoinDate(member.joined_at)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {/* Role Selector */}
                {canManageRole(member.role) && member.user_id !== currentUserId && (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.user_id, e.target.value as 'admin' | 'member' | 'viewer')}
                    disabled={loadingActions[`role-${member.user_id}`]}
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                )}

                {/* Remove Button */}
                {canRemoveMember(member.user_id, member.role) && (
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    disabled={loadingActions[`remove-${member.user_id}`]}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove member"
                  >
                    {loadingActions[`remove-${member.user_id}`] ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {/* Member Status */}
            {!member.user?.is_active && (
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                Inactive Account
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembersList;