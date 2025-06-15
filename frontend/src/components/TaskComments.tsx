import { useState, useRef, useEffect } from 'react';
import { TaskComment, Task } from '../types';

interface TaskCommentsProps {
  task?: Task;
  comments: TaskComment[];
  onCommentAdd: (content: string, parentId?: string) => void;
  onCommentUpdate: (commentId: string, content: string) => void;
  onCommentDelete: (commentId: string) => void;
  currentUser: string;
}

interface MentionUser {
  username: string;
  displayName: string;
  avatar?: string;
}

// Mock users for @mentions - in real app this would come from user service
const AVAILABLE_USERS: MentionUser[] = [
  { username: 'john.doe', displayName: 'John Doe' },
  { username: 'jane.smith', displayName: 'Jane Smith' },
  { username: 'bob.wilson', displayName: 'Bob Wilson' },
  { username: 'alice.brown', displayName: 'Alice Brown' },
  { username: 'charlie.davis', displayName: 'Charlie Davis' },
];

export function TaskComments({ 
  comments, 
  onCommentAdd, 
  onCommentUpdate, 
  onCommentDelete, 
  currentUser 
}: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  // Parse @mentions in text
  const parseMentions = (text: string): string[] => {
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  };

  // Handle @mention detection while typing
  const handleInputChange = (value: string, textarea: HTMLTextAreaElement) => {
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9._-]*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setShowMentions(true);
      
      // Calculate position for mentions dropdown
      const rect = textarea.getBoundingClientRect();
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length - 1;
      const lineHeight = 20; // Approximate line height
      
      setMentionPosition({
        top: rect.top + (currentLine * lineHeight) + lineHeight + 5,
        left: rect.left + (mentionMatch.index || 0) * 8, // Approximate character width
      });
    } else {
      setShowMentions(false);
    }
  };

  // Filter users based on mention query
  const filteredUsers = AVAILABLE_USERS.filter(user => 
    user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Insert mention into text
  const insertMention = (user: MentionUser) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = newComment.substring(0, cursorPosition);
    const textAfterCursor = newComment.substring(cursorPosition);
    
    // Find the @ symbol to replace
    const mentionStart = textBeforeCursor.lastIndexOf('@');
    const beforeMention = textBeforeCursor.substring(0, mentionStart);
    const newText = `${beforeMention}@${user.username} ${textAfterCursor}`;
    
    setNewComment(newText);
    setShowMentions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = mentionStart + user.username.length + 2;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Render comment content with highlighted mentions
  const renderCommentContent = (content: string) => {
    const parts = content.split(/(@[a-zA-Z0-9._-]+)/);
    return (
      <span>
        {parts.map((part, index) => {
          if (part.startsWith('@')) {
            const username = part.substring(1);
            const user = AVAILABLE_USERS.find(u => u.username === username);
            return (
              <span
                key={index}
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 rounded font-medium"
                title={user?.displayName || username}
              >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  // Group comments by thread
  const threadedComments = comments.reduce((acc, comment) => {
    if (!comment.parent_comment_id) {
      acc.push({ ...comment, replies: [] });
    } else {
      const parent = acc.find(c => c.id === comment.parent_comment_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      }
    }
    return acc;
  }, [] as (TaskComment & { replies: TaskComment[] })[]);

  const handleSubmitComment = (content: string, parentId?: string) => {
    if (!content.trim()) return;
    
    parseMentions(content);
    onCommentAdd(content, parentId);
    
    if (!parentId) {
      setNewComment('');
    }
    setReplyingTo(null);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Close mentions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mentionsRef.current && !mentionsRef.current.contains(event.target as Node)) {
        setShowMentions(false);
      }
    };

    if (showMentions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMentions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          💬 Discussion
          <span className="text-sm text-gray-500 dark:text-gray-400">({comments.length})</span>
        </h4>
      </div>

      {/* New Comment */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {currentUser.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                handleInputChange(e.target.value, e.target);
              }}
              placeholder="Add a comment... Use @username to mention someone"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
              rows={3}
            />
            
            {/* Mentions Dropdown */}
            {showMentions && filteredUsers.length > 0 && (
              <div
                ref={mentionsRef}
                className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                style={{
                  top: mentionPosition.top,
                  left: mentionPosition.left,
                  minWidth: '200px'
                }}
              >
                {filteredUsers.map(user => (
                  <button
                    key={user.username}
                    onClick={() => insertMention(user)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                      {user.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.displayName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                📝 Supports @mentions and markdown formatting
              </div>
              <button
                onClick={() => handleSubmitComment(newComment)}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Thread */}
      <div className="space-y-4">
        {threadedComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            <p>No comments yet. Start the discussion!</p>
          </div>
        ) : (
          threadedComments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Main Comment */}
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {comment.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{comment.author}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                    {comment.updated_at && comment.updated_at !== comment.created_at && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
                    )}
                  </div>
                  
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onCommentUpdate(comment.id, editContent);
                            setEditingComment(null);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {renderCommentContent(comment.content)}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Reply
                    </button>
                    {comment.author === currentUser && (
                      <>
                        <button
                          onClick={() => {
                            setEditingComment(comment.id);
                            setEditContent(comment.content);
                          }}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onCommentDelete(comment.id)}
                          className="text-sm text-red-600 dark:text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-11 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <ReplyForm
                    onSubmit={(content) => handleSubmitComment(content, comment.id)}
                    onCancel={() => setReplyingTo(null)}
                    currentUser={currentUser}
                    parentAuthor={comment.author}
                  />
                </div>
              )}
              
              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {reply.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{reply.author}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(reply.created_at)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {renderCommentContent(reply.content)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Reply Form Component
function ReplyForm({ 
  onSubmit, 
  onCancel, 
  currentUser, 
  parentAuthor 
}: {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  currentUser: string;
  parentAuthor: string;
}) {
  const [replyContent, setReplyContent] = useState(`@${parentAuthor} `);
  
  return (
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
        {currentUser.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Write a reply..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
          rows={2}
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onSubmit(replyContent)}
            disabled={!replyContent.trim()}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Reply
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}