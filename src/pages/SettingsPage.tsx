/**
 * SettingsPage.tsx
 *
 * App settings page with three sections: appearance account and data
 * Appearance has a dark/light mode toggle
 * Account lets the user change their username or password
 * Data lets the user export all their tasks as a JSON file
 * Feedback messages auto clear after 3 seconds so the UI stays clean
 */

import { useState } from 'react';
import { Moon, Sun, User, Lock, Download, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Task } from '../types';
import { api } from '../lib/api';

export default function SettingsPage() {
  const { user, login } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // username change form
  const [newUsername, setNewUsername] = useState('');
  const [usernameMsg, setUsernameMsg] = useState<{type: 'ok'|'err', text: string} | null>(null);

  // password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{type: 'ok'|'err', text: string} | null>(null);

  // export feedback
  const [exportMsg, setExportMsg] = useState('');

  // updates the username and refreshes the auth store so the sidebar reflects the change
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) return;
    try {
      const res = await api.auth.updateUsername(newUsername.trim());
      if (res.success) {
        login({ ...user!, username: newUsername.trim() });
        setUsernameMsg({ type: 'ok', text: 'Username updated!' });
        setNewUsername('');
      } else {
        setUsernameMsg({ type: 'err', text: res.error || 'Failed to update' });
      }
    } catch {
      setUsernameMsg({ type: 'err', text: 'Something went wrong' });
    }
    // auto clear the message after 3 seconds
    setTimeout(() => setUsernameMsg(null), 3000);
  };

  // verifies the current password then saves the new one
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'err', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'err', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      const res = await api.auth.updatePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordMsg({ type: 'ok', text: 'Password updated!' });
        // clear all three fields on success
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordMsg({ type: 'err', text: res.error || 'Failed to update' });
      }
    } catch {
      setPasswordMsg({ type: 'err', text: 'Something went wrong' });
    }
    setTimeout(() => setPasswordMsg(null), 3000);
  };

  // fetches all tasks and triggers a browser download as a JSON file
  const handleExport = async () => {
    try {
      const res = await api.tasks.export();
      if (res.success && res.data) {
        const tasks = res.data as Task[];

        // create a blob and trigger a download without needing a server route
        const blob = new Blob(
          [JSON.stringify(tasks, null, 2)],
          { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focusflow-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        setExportMsg(`Exported ${tasks.length} tasks`);
        setTimeout(() => setExportMsg(''), 3000);
      }
    } catch {
      setExportMsg('Export failed');
    }
  };

  return (
    <div className="flex-1 max-w-xl mx-auto w-full px-6 py-8 space-y-8 animate-fade-in">

      {/* page header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your preferences and account</p>
      </div>

      {/* appearance section */}
      <SettingsSection title="Appearance" icon={<Sun size={16} />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-200">Theme</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {theme === 'dark' ? 'Dark mode is on' : 'Light mode is on'}
            </p>
          </div>

          {/* toggle switch slides the knob and changes color based on theme */}
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200
                        flex items-center
                        ${theme === 'dark' ? 'bg-brand' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute w-5 h-5 bg-white rounded-full shadow-sm
                          transition-transform duration-200 flex items-center justify-center
                          ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
            >
              {theme === 'dark'
                ? <Moon size={10} className="text-brand" />
                : <Sun size={10} className="text-yellow-500" />
              }
            </span>
          </button>
        </div>
      </SettingsSection>

      {/* account section */}
      <SettingsSection title="Account" icon={<User size={16} />}>

        {/* current user info row */}
        <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
          <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="text-xs text-gray-500 font-mono">{user?.id}</p>
          </div>
        </div>

        {/* change username form */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Change Username
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateUsername()}
              placeholder="New username"
              className="flex-1 bg-surface-base border border-surface-border rounded-lg
                         px-3 py-2 text-sm text-white placeholder-gray-600
                         focus:outline-none focus:border-brand transition-colors"
            />
            <button
              onClick={handleUpdateUsername}
              disabled={!newUsername.trim()}
              className="bg-brand hover:bg-brand-hover disabled:opacity-40
                         text-white text-sm font-medium px-4 py-2 rounded-lg
                         transition-colors"
            >
              Save
            </button>
          </div>
          {usernameMsg && (
            <p className={`text-xs ${usernameMsg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
              {usernameMsg.type === 'ok' && <Check size={12} className="inline mr-1" />}
              {usernameMsg.text}
            </p>
          )}
        </div>

        {/* change password form */}
        <div className="space-y-2 pt-4 border-t border-surface-border">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider
                             flex items-center gap-1.5">
            <Lock size={11} />
            Change Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full bg-surface-base border border-surface-border rounded-lg
                       px-3 py-2 text-sm text-white placeholder-gray-600
                       focus:outline-none focus:border-brand transition-colors"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="w-full bg-surface-base border border-surface-border rounded-lg
                       px-3 py-2 text-sm text-white placeholder-gray-600
                       focus:outline-none focus:border-brand transition-colors"
          />
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdatePassword()}
            placeholder="Confirm new password"
            className="w-full bg-surface-base border border-surface-border rounded-lg
                       px-3 py-2 text-sm text-white placeholder-gray-600
                       focus:outline-none focus:border-brand transition-colors"
          />
          <button
            onClick={handleUpdatePassword}
            disabled={!currentPassword || !newPassword || !confirmNewPassword}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-40
                       text-white text-sm font-semibold py-2 rounded-lg
                       transition-colors"
          >
            Update Password
          </button>
          {passwordMsg && (
            <p className={`text-xs ${passwordMsg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
              {passwordMsg.text}
            </p>
          )}
        </div>

      </SettingsSection>

      {/* data export section */}
      <SettingsSection title="Data" icon={<Download size={16} />}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-200">Export Tasks</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Download all your tasks as a JSON file
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-surface-base hover:bg-surface-border
                       border border-surface-border text-gray-300 text-sm font-medium
                       px-4 py-2 rounded-lg transition-colors"
          >
            <Download size={14} />
            Export
          </button>
        </div>
        {exportMsg && (
          <p className="text-xs text-green-400">✓ {exportMsg}</p>
        )}
      </SettingsSection>

      {/* app version info */}
      <div className="text-center py-4 space-y-1">
        <p className="text-xs text-gray-700">FocusFlow v0.1.0</p>
        <p className="text-xs text-gray-700">Built with Next.js + React + PostgreSQL</p>
      </div>

    </div>
  );
}

// reusable card wrapper used for each settings section
function SettingsSection({
  title, icon, children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-raised border border-surface-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
        <span className="text-gray-400">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}