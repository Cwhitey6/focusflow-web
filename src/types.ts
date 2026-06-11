/**
 * types.ts
 *
 * Shared TypeScript types used across the entire app
 * Defining them once here means if the shape of our data changes
 * we only need to update it in one place
 */

// the logged in user returned by the session check and login endpoints
export interface User {
  id: string;
  username: string;
}

// a workspace that contains lists and tasks
export interface Project {
  id: string;
  user_id: string;
  name: string;
  color: string;    // hex color used for the dot in the sidebar
  icon: string;     // emoji icon shown next to the project name
  created_at: string;
  archived: boolean;
}

// a kanban column inside a project like To Do In Progress or Done
export interface List {
  id: string;
  project_id: string;
  name: string;
  position: number; // determines the left to right order on the board
}

// an individual task inside a list
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
  completed_at: string | null; // set when the task is checked off cleared when unchecked
  position: number;
  created_at: string;
}

// a label that can be attached to tasks
export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
}

// the standard shape returned by every API route
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// the shape used when creating a new task from the frontend
export interface CreateTaskInput {
  list_id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: 'urgent' | 'high' | 'normal' | 'low';
}

// display metadata for each priority level used by task rows and kanban cards
export const PRIORITIES = {
  urgent: { label: 'Urgent', color: '#ef4444' }, // red
  high:   { label: 'High',   color: '#f97316' }, // orange
  normal: { label: 'Normal', color: '#3b82f6' }, // blue
  low:    { label: 'Low',    color: '#22c55e' }, // green
} as const;