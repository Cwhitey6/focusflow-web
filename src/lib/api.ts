/**
 * api.ts
 *
 * Central API client for the entire app
 * Every function here maps to one serverless API route in pages/api
 * All requests go through the shared request helper which handles
 * headers and JSON parsing in one place
 * Auth is handled via HTTP only cookies so no tokens are passed manually
 */

// shared fetch wrapper used by every API call
// returns a consistent shape so every caller can check res.success
async function request<T>(
  url: string,
  options?: RequestInit
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  return res.json();
}

export const api = {

  // auth routes handle login registration and session management
  auth: {
    // creates a new account and logs the user in immediately
    register: (username: string, password: string) =>
      request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    // verifies credentials and sets the session cookie
    login: (username: string, password: string) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    // clears the session cookie
    logout: () => request('/api/auth/logout', { method: 'POST' }),

    // checks if the current session cookie is valid and returns the user
    me: () => request('/api/auth/me'),

    // updates the username in the database
    updateUsername: (newUsername: string) =>
      request('/api/auth/update-username', {
        method: 'POST',
        body: JSON.stringify({ newUsername }),
      }),

    // verifies the current password before saving the new one
    updatePassword: (currentPassword: string, newPassword: string) =>
      request('/api/auth/update-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  // project routes manage the users workspaces
  projects: {
    // returns all non-archived projects for the logged in user
    get: () => request('/api/projects/get'),

    // creates a new project and auto-generates three kanban columns
    create: (name: string, color: string, icon: string) =>
      request('/api/projects/create', {
        method: 'POST',
        body: JSON.stringify({ name, color, icon }),
      }),

    // updates the name color and icon of an existing project
    update: (projectId: string, name: string, color: string, icon: string) =>
      request('/api/projects/update', {
        method: 'POST',
        body: JSON.stringify({ projectId, name, color, icon }),
      }),

    // deletes the project and all its lists and tasks via cascade
    delete: (projectId: string) =>
      request('/api/projects/delete', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      }),

    // returns the special inbox project that is auto-created on registration
    inbox: () => request('/api/projects/inbox'),
  },

  // list routes manage the kanban columns inside a project
  lists: {
    // returns all lists for a project ordered by position
    get: (projectId: string) =>
      request(`/api/lists/get?projectId=${projectId}`),
  },

  // task routes handle all task crud and movement
  tasks: {
    // returns all tasks for a project ordered by position
    get: (projectId: string) =>
      request(`/api/tasks/get?projectId=${projectId}`),

    // creates a new task in a specific list
    create: (data: {
      listId: string;
      projectId: string;
      title: string;
      description: string;
      dueDate: string | null;
      priority: string;
    }) =>
      request('/api/tasks/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // updates the title description due date and priority of a task
    update: (data: {
      id: string;
      title: string;
      description: string;
      dueDate: string | null;
      priority: string;
    }) =>
      request('/api/tasks/update', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // marks a task complete or incomplete and sets the completed_at timestamp
    toggle: (id: string, completed: boolean) =>
      request('/api/tasks/toggle', {
        method: 'POST',
        body: JSON.stringify({ id, completed }),
      }),

    // permanently removes a task
    delete: (id: string) =>
      request('/api/tasks/delete', {
        method: 'POST',
        body: JSON.stringify({ id }),
      }),

    // moves a task to a different list (kanban column)
    move: (taskId: string, newListId: string) =>
      request('/api/tasks/move', {
        method: 'POST',
        body: JSON.stringify({ taskId, newListId }),
      }),

    // searches task titles and descriptions using a text query
    search: (query: string) =>
      request(`/api/tasks/search?query=${encodeURIComponent(query)}`),

    // returns all incomplete tasks due today across all projects
    today: () => request('/api/tasks/today'),

    // returns all tasks for the user as a JSON export
    export: () => request('/api/tasks/export'),

    // deletes all completed tasks in a project at once
    deleteCompleted: (projectId: string) =>
      request('/api/tasks/delete-completed', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      }),
  },
};