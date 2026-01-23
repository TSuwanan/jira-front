const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
console.log('API_URL:', API_URL); // เพิ่มบรรทัดนี้เพื่อ debug

// Clear auth data from localStorage
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Get token from localStorage
export function getToken(): string | null {
  return localStorage.getItem('token');
}
// Get user from localStorage
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

// Handle logout and redirect
export function handleAuthError() {
  clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// API fetch wrapper with network error handling
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      handleAuthError();
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    // Handle network errors (backend down)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      handleAuthError();
      throw new Error('Server unavailable');
    }
    throw error;
  }
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id: string;
  user_code: string;
  email: string;
  full_name: string;
  role_id: number;
  position_code?: string | number;
  level_code?: string | number;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Login
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

// Register
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return response.json();
}

// Get current user
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetchWithAuth(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user');
  }

  const data = await response.json();
  return data.user;
}

// Get all users with pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getUsers(token: string, page: number = 1, limit: number = 10, search: string = ''): Promise<PaginatedResponse<User>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) {
    params.append('search', search);
  }
  const response = await fetchWithAuth(`${API_URL}/api/users?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  const result = await response.json();

  return {
    data: result.data || [],
    total: result.pagination?.total || 0,
    page: result.pagination?.page || page,
    limit: result.pagination?.limit || limit,
    totalPages: result.pagination?.totalPages || 1,
  };
}

// Get all members (non-paginated for selection lists)
export async function getMembers(token: string): Promise<User[]> {
  const response = await fetchWithAuth(`${API_URL}/api/users/members`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch members');
  }

  const result = await response.json();
  return result.data || result.members || result || [];
}

// Role interface
export interface Role {
  id: number;
  name: string;
  code?: string;
}

// Get all roles
export async function getRoles(token: string): Promise<Role[]> {
  const response = await fetchWithAuth(`${API_URL}/api/roles`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch roles');
  }

  const result = await response.json();
  return result.data || result.roles || result || [];
}

// Create user payload
export interface CreateUserData {
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  position_code: string;
  level_code: string;
}

// Create user
export async function createUser(token: string, data: CreateUserData): Promise<User> {
  const response = await fetchWithAuth(`${API_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to create user');
  }

  const result = await response.json();
  return result.data || result.user || result;
}

// Project interface
export interface Project {
  id: string | number;
  project_code: string;
  name: string;
  created_by?: string | number;
  created_at?: string;
  updated_at?: string;
  owner_name?: string;
  task_count?: number;
}

// Get all projects with pagination
export async function getProjects(token: string, page: number = 1, limit: number = 10, search: string = ''): Promise<PaginatedResponse<Project>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) {
    params.append('search', search);
  }
  const response = await fetchWithAuth(`${API_URL}/api/projects?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  const result = await response.json();

  return {
    data: result.data || [],
    total: result.pagination?.total || 0,
    page: result.pagination?.page || page,
    limit: result.pagination?.limit || limit,
    totalPages: result.pagination?.totalPages || 1,
  };
}

// Create/Update project payload
export interface CreateProjectData {
  name: string;
  description?: string;
  member_ids: string[];
}

// Project detail interface (includes members)
export interface ProjectDetail extends Project {
  description?: string;
  members?: User[];
}

// Get single project by ID
export async function getProject(token: string, id: string): Promise<ProjectDetail> {
  const response = await fetchWithAuth(`${API_URL}/api/projects/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }

  const result = await response.json();
  return result.data || result.project || result;
}

// Create project
export async function createProject(token: string, data: CreateProjectData): Promise<Project> {
  const response = await fetchWithAuth(`${API_URL}/api/projects`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const error = JSON.parse(text);
      throw new Error(error.message || error.error || 'Failed to create project');
    } catch {
      throw new Error(text || 'Failed to create project');
    }
  }

  const result = await response.json();
  return result.data || result.project || result;
}

// Edit project
export async function editProject(token: string, id: string, data: CreateProjectData): Promise<Project> {
  const response = await fetchWithAuth(`${API_URL}/api/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const error = JSON.parse(text);
      throw new Error(error.message || error.error || 'Failed to edit project');
    } catch {
      throw new Error(text || 'Failed to edit project');
    }
  }

  const result = await response.json();
  return result.data || result.project || result;
}

// Get project members
export async function getProjectMembers(token: string, projectId: string): Promise<User[]> {
  const response = await fetchWithAuth(`${API_URL}/api/projects/${projectId}/members`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project members');
  }

  const result = await response.json();
  return result.data || result.members || result || [];
}

// Task interface
export interface Task {
  id: string;
  task_code: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  project_id?: string;
  project_name?: string;
  assignee_id?: string;
  assignee_name?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

// Get all tasks with pagination
export async function getTasks(token: string, page: number = 1, limit: number = 10, search: string = '', status: string = ''): Promise<PaginatedResponse<Task>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) {
    params.append('search', search);
  }
  if (status) {
    params.append('status', status);
  }
  const response = await fetchWithAuth(`${API_URL}/api/tasks?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  const result = await response.json();

  return {
    data: result.data || [],
    total: result.pagination?.total || 0,
    page: result.pagination?.page || page,
    limit: result.pagination?.limit || limit,
    totalPages: result.pagination?.totalPages || 1,
  };
}

// Create task payload
export interface CreateTaskData {
  title: string;
  description?: string;
  status: string;
  priority: string;
  project_id: string;
  assignee_id?: string;
}

// Add task
export async function addTask(token: string, data: CreateTaskData): Promise<Task> {
  const response = await fetchWithAuth(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const error = JSON.parse(text);
      throw new Error(error.message || error.error || 'Failed to create task');
    } catch {
      throw new Error(text || 'Failed to create task');
    }
  }

  const result = await response.json();
  return result.data || result.task || result;
}

// Get single task by ID
export async function getTask(token: string, id: string): Promise<Task> {
  const response = await fetchWithAuth(`${API_URL}/api/tasks/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }

  const result = await response.json();
  return result.data || result.task || result;
}

// Update task status
export async function updateTaskStatus(token: string, taskId: string, status: string): Promise<Task> {
  const response = await fetchWithAuth(`${API_URL}/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const error = JSON.parse(text);
      throw new Error(error.message || error.error || 'Failed to update task status');
    } catch {
      throw new Error(text || 'Failed to update task status');
    }
  }

  const result = await response.json();
  return result.data || result.task || result;
}