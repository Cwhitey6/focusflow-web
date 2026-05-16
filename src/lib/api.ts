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
  auth: {
    register: (username: string, password: string) =>
      request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    login: (username: string, password: string) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me: () => request('/api/auth/me'),
    updateUsername: (newUsername: string) =>
      request('/api/auth/update-username', {
        method: 'POST',
        body: JSON.stringify({ newUsername }),
      }),
    updatePassword: (currentPassword: string, newPassword: string) =>
      request('/api/auth/update-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  projects: {
    get: () => request('/api/projects/get'),
    create: (name: string, color: string, icon: string) =>
      request('/api/projects/create', {
        method: 'POST',
        body: JSON.stringify({ name, color, icon }),
      }),
    update: (projectId: string, name: string, color: string, icon: string) =>
      request('/api/projects/update', {
        method: 'POST',
        body: JSON.stringify({ projectId, name, color, icon }),
      }),
    delete: (projectId: string) =>
      request('/api/projects/delete', {
        method: 'POST',
        body: JSON.stringify({ projectId }),
      }),
    inbox: () => request('/api/projects/inbox'),
  },

  lists: {
    get: (projectId: string) =>
      request(`/api/lists/get?projectId=${projectId}`),
  },

  tasks: {
    get: (projectId: string) =>
      request(`/api/tasks/get?projectId=${projectId}`),
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
    toggle: (id: string, completed: boolean) =>
      request('/api/tasks/toggle', {
        method: 'POST',
        body: JSON.stringify({ id, completed }),
      }),
    delete: (id: string) =>
      request('/api/tasks/delete', {
        method: 'POST',
        body: JSON.stringify({ id }),
      }),
    move: (taskId: string, newListId: string) =>
      request('/api/tasks/move', {
        method: 'POST',
        body: JSON.stringify({ taskId, newListId }),
      }),
    search: (query: string) =>
      request(`/api/tasks/search?query=${encodeURIComponent(query)}`),
    today: () => request('/api/tasks/today'),
    export: () => request('/api/tasks/export'),
  },
};