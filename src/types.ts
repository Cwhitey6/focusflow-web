// types.ts — Shared TypeScript types used across the entire app.
// Defining them once here means if the shape of our data changes,
// we only update it in one place.

export interface User {
  id: string;
  username: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  archived: boolean;
}

export interface List {
  id: string;
  project_id: string;
  name: string;
  position: number;
}

export interface Task {
  id: string;
  list_id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  completed: boolean;
  completed_at: string | null;
  position: number;
  created_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

// This is what every Rust command returns
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// Used when creating a new task from the frontend
export interface CreateTaskInput {
  list_id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: 'urgent' | 'high' | 'normal' | 'low';
}

// Priority metadata for display
export const PRIORITIES = {
  urgent: { label: 'Urgent', color: '#ef4444' },
  high:   { label: 'High',   color: '#f97316' },
  normal: { label: 'Normal', color: '#3b82f6' },
  low:    { label: 'Low',    color: '#22c55e' },
} as const;