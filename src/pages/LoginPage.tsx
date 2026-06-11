/**
 * LoginPage.tsx
 *
 * Handles both login and registration in a single screen
 * Toggling between the two modes swaps the form fields and button text
 * On successful login or registration the user object is stored in the auth store
 * which causes the app to redirect to the dashboard automatically
 */

import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

interface LoginResult {
  id: string;
  username: string;
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false); // toggles between login and register mode
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // only used in register mode
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  const handleSubmit = async () => {
    setError('');

    // basic validation before hitting the API
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (isRegister && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        // register creates the account and logs in immediately on success
        const createRes = await api.auth.register(username.trim(), password);

        if (!createRes.success) {
          setError(createRes.error || 'Registration failed');
          return;
        }

        if (createRes.success && createRes.data) {
          login(createRes.data as LoginResult);
        }
      } else {
        // login verifies credentials and sets the session cookie
        const res = await api.auth.login(username.trim(), password);

        if (res.success && res.data) {
          login(res.data as LoginResult);
        } else {
          setError(res.error || 'Login failed');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // allow submitting the form with the Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">

        {/* app logo and title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-brand rounded-2xl mx-auto flex items-center justify-center">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">FocusFlow</h1>
            <p className="text-gray-500 text-sm mt-1">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </p>
          </div>
        </div>

        {/* form card */}
        <div className="bg-surface-raised border border-surface-border rounded-2xl p-6 space-y-4">

          {/* username field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your username"
              autoComplete="username"
              className="w-full bg-surface-base border border-surface-border rounded-lg
                         px-3.5 py-2.5 text-white placeholder-gray-600 text-sm
                         focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                         transition-colors duration-150"
            />
          </div>

          {/* password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="w-full bg-surface-base border border-surface-border rounded-lg
                         px-3.5 py-2.5 text-white placeholder-gray-600 text-sm
                         focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                         transition-colors duration-150"
            />
          </div>

          {/* confirm password only shown in register mode */}
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="w-full bg-surface-base border border-surface-border rounded-lg
                           px-3.5 py-2.5 text-white placeholder-gray-600 text-sm
                           focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand
                           transition-colors duration-150"
              />
            </div>
          )}

          {/* error message shown below the fields */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* submit button text changes based on mode and loading state */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50
                       disabled:cursor-not-allowed text-white font-semibold
                       py-2.5 rounded-lg transition-colors duration-150 text-sm"
          >
            {isLoading
              ? (isRegister ? 'Creating account...' : 'Signing in...')
              : (isRegister ? 'Create Account' : 'Sign In')
            }
          </button>

        </div>

        {/* toggle between login and register modes */}
        <p className="text-center text-sm text-gray-500">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');           // clear errors when switching modes
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-brand hover:text-brand-hover font-medium transition-colors"
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </button>
        </p>

      </div>
    </div>
  );
}