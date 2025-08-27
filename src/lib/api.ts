// API utility functions for the environment manager

export interface ApiProject {
  _id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEnvironment {
  _id: string;
  name: string;
  type: 'prod' | 'stage' | 'dev' | 'test';
  status: 'active' | 'inactive' | 'maintenance';
  projectId: string;
  variables: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Projects API
export const projectsApi = {
  async getAll(): Promise<{ projects: ApiProject[]; success: boolean }> {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  },

  async create(data: { name: string; description: string }): Promise<{ project: ApiProject; success: boolean }> {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    return response.json();
  },

  async getById(id: string): Promise<{ project: ApiProject; success: boolean }> {
    const response = await fetch(`/api/projects/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }
    return response.json();
  },

  async update(id: string, data: { name: string; description: string }): Promise<{ project: ApiProject; success: boolean }> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    return response.json();
  },

  async delete(id: string): Promise<{ message: string; success: boolean }> {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
    return response.json();
  },
};

// Environments API
export const environmentsApi = {
  async getByProjectId(projectId: string): Promise<{ environments: ApiEnvironment[]; success: boolean }> {
    const response = await fetch(`/api/environments?projectId=${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch environments');
    }
    return response.json();
  },

  async create(data: {
    name: string;
    type: 'prod' | 'stage' | 'dev' | 'test';
    status: 'active' | 'inactive' | 'maintenance';
    projectId: string;
  }): Promise<{ environment: ApiEnvironment; success: boolean }> {
    const response = await fetch('/api/environments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create environment');
    }
    return response.json();
  },

  async getById(id: string): Promise<{ environment: ApiEnvironment; success: boolean }> {
    const response = await fetch(`/api/environments/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch environment');
    }
    return response.json();
  },

  async update(id: string, data: {
    name?: string;
    type?: 'prod' | 'stage' | 'dev' | 'test';
    status?: 'active' | 'inactive' | 'maintenance';
  }): Promise<{ environment: ApiEnvironment; success: boolean }> {
    const response = await fetch(`/api/environments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update environment');
    }
    return response.json();
  },

  async delete(id: string): Promise<{ message: string; success: boolean }> {
    const response = await fetch(`/api/environments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete environment');
    }
    return response.json();
  },
};

// Variables API
export const variablesApi = {
  async getByEnvironmentId(environmentId: string): Promise<{ variables: Record<string, string>; success: boolean }> {
    const response = await fetch(`/api/variables?environmentId=${environmentId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch variables');
    }
    return response.json();
  },

  async createOrUpdate(data: {
    environmentId: string;
    key: string;
    value: string;
  }): Promise<{ message: string; variables: Record<string, string>; success: boolean }> {
    const response = await fetch('/api/variables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create/update variable');
    }
    return response.json();
  },

  async update(environmentId: string, key: string, value: string): Promise<{ message: string; key: string; value: string; success: boolean }> {
    const response = await fetch(`/api/variables/${environmentId}/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (!response.ok) {
      throw new Error('Failed to update variable');
    }
    return response.json();
  },

  async delete(environmentId: string, key: string): Promise<{ message: string; key: string; success: boolean }> {
    const response = await fetch(`/api/variables/${environmentId}/${key}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete variable');
    }
    return response.json();
  },

  async bulkImport(data: {
    environmentId: string;
    envText: string;
  }): Promise<{ message: string; imported: number; variables: Record<string, string>; success: boolean }> {
    const response = await fetch('/api/variables/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to import variables');
    }
    return response.json();
  },
};
