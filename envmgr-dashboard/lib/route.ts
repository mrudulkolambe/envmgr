class APIRoutes {
    static readonly AUTH_LOGIN = '/auth/login';
    static readonly AUTH_SIGNUP = '/auth/signup';
    static readonly AUTH_ME = '/auth/me';
    static readonly PROJECTS = '/projects';
    static readonly PROJECT_MEMBERS = (id: string) => `/projects/${id}/members`;
    static readonly PROJECT_INVITES = (id: string) => `/projects/${id}/invites`;
    static readonly ENVIRONMENTS = '/environments';
    static readonly VARIABLES = '/variables';
}




export { APIRoutes };