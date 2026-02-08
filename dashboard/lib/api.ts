const APIs = {
    auth: {
        signup: '/api/auth/signup',
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        me: '/api/auth/me',
    },
    orgs: {
        list: '/api/orgs',
        create: '/api/orgs',
        details: (orgId: string) => `/api/orgs/${orgId}`,
        projects: (orgId: string) => `/api/orgs/${orgId}/projects`,
    },
    projects: {
        details: (projectId: string) => `/api/projects/${projectId}`,
        environments: (projectId: string) => `/api/projects/${projectId}/environments`,
    },
    environments: {
        variables: (envId: string) => `/api/environments/${envId}/variables`,
        replaceVariables: (envId: string) => `/api/environments/${envId}/variables/replace`,
    }
} as const;

export default APIs;
