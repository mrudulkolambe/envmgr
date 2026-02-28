class APIRoutes {
    static readonly AUTH_LOGIN = '/auth/login';
    static readonly AUTH_SIGNUP = '/auth/signup';
    static readonly AUTH_ME = '/auth/me';

    static readonly PROJECTS = '/projects';
    static readonly PROJECT_DETAILS = (id: string) => `/projects/${id}`;

    static readonly ENVIRONMENTS = '/environments';
    static readonly ENVIRONMENT_DETAILS = (id: string) => `/environments/${id}`;

    static readonly VARIABLES = '/variables';
    static readonly VARIABLES_BULK = '/variables/bulk';
    static readonly VARIABLE_DETAILS = (id: string) => `/variables/${id}`;

    static readonly SNAPSHOTS = '/snapshots';
    static readonly SNAPSHOT_RESTORE = (id: string) => `/snapshots/${id}/restore`;

    static readonly FEATURE_FLAGS = '/feature-flags';
    static readonly FEATURE_FLAG_DETAILS = (id: string) => `/feature-flags/${id}`;

    static readonly HEALTH = '/health';
}

export { APIRoutes };