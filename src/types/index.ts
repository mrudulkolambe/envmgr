export type EnvironmentType = 'prod' | 'stage' | 'dev' | 'test';
export type EnvironmentStatus = 'active' | 'inactive' | 'maintenance';

export interface EnvironmentVariable {
  [key: string]: string;
}

export interface Environment {
  id: number;
  name: string;
  type: EnvironmentType;
  status: EnvironmentStatus;
  variables: EnvironmentVariable;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  environments: Environment[];
}

export type EnvTypeColors = {
  [key in EnvironmentType]: string;
};

export type EnvTypeIcons = {
  [key in EnvironmentType]: React.ComponentType<{ size: number }>;
};
