import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TeamService, Team, TeamMember } from '../services/teamService';
import CreateTeamModal from './CreateTeamModal';
import TeamMembersList from './TeamMembersList';
import InviteTeamMemberModal from './InviteTeamMemberModal';

const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Load user's teams
  useEffect(() => {
    loadTeams();
  }, []);

  // Load team members when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers();
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const myTeams = await TeamService.getMyTeams();
      setTeams(myTeams);
      
      if (myTeams.length > 0 && !selectedTeam) {
        setSelectedTeam(myTeams[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async () => {
    if (!selectedTeam) return;

    try {
      const members = await TeamService.getTeamMembers(selectedTeam.id);
      setTeamMembers(members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    }
  };

  const handleCreateTeam = async (teamData: { name: string; description?: string; slug: string }) => {
    try {
      const newTeam = await TeamService.createTeam(teamData);
      setTeams([...teams, newTeam]);
      setSelectedTeam(newTeam);
      setShowCreateModal(false);
    } catch (err) {
      throw err; // Let the modal handle the error
    }
  };

  const handleInviteMember = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    if (!selectedTeam) return;

    try {
      await TeamService.inviteTeamMember(selectedTeam.id, { email, role });
      setShowInviteModal(false);
      // Refresh team members list
      await loadTeamMembers();
    } catch (err) {
      throw err; // Let the modal handle the error
    }
  };

  const handleUpdateMemberRole = async (userId: string, role: 'admin' | 'member' | 'viewer') => {
    if (!selectedTeam) return;

    try {
      await TeamService.updateTeamMember(selectedTeam.id, userId, { role });
      await loadTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;

    try {
      await TeamService.removeTeamMember(selectedTeam.id, userId);
      await loadTeamMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
    }
  };

  const getCurrentUserRole = (): string => {
    if (!user || !selectedTeam) return 'viewer';
    
    const member = teamMembers.find(m => m.user_id === user.id);
    return member?.role || 'viewer';
  };

  const canManageTeam = (): boolean => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'admin';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create Team
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Teams</h2>
            </div>
            <div className="p-4">
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No teams found</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium"
                  >
                    Create your first team
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTeam?.id === team.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent'
                      } border`}
                    >
                      <div className="flex items-center space-x-3">
                        {team.avatar_url ? (
                          <img
                            src={team.avatar_url}
                            alt={team.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {team.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {team.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {team.member_count || 0} members
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2">
          {selectedTeam ? (
            <div className="space-y-6">
              {/* Team Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {selectedTeam.avatar_url ? (
                        <img
                          src={selectedTeam.avatar_url}
                          alt={selectedTeam.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-lg font-medium">
                            {selectedTeam.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {selectedTeam.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">@{selectedTeam.slug}</p>
                      </div>
                    </div>
                    {canManageTeam() && (
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Invite Member
                      </button>
                    )}
                  </div>
                  {selectedTeam.description && (
                    <p className="text-gray-600 dark:text-gray-300">{selectedTeam.description}</p>
                  )}
                </div>
              </div>

              {/* Team Members */}
              <TeamMembersList
                members={teamMembers}
                currentUserId={user?.id || ''}
                currentUserRole={getCurrentUserRole()}
                onUpdateRole={handleUpdateMemberRole}
                onRemoveMember={handleRemoveMember}
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a team to view details and manage members
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTeam}
        />
      )}

      {showInviteModal && selectedTeam && (
        <InviteTeamMemberModal
          teamName={selectedTeam.name}
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInviteMember}
        />
      )}
    </div>
  );
};

export default TeamManagement;