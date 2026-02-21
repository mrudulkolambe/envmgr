import { getToken, getApiUrl } from '../config/config.js';
import chalk from 'chalk';
import { performance } from 'perf_hooks';
export async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const isDebug = process.env.ENVMGR_DEBUG === '1';
    const method = options.method || 'GET';
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
    if (isDebug) {
        console.log(`${chalk.blue('→')} ${chalk.bold(method)} ${chalk.dim(url)}`);
    }
    const start = performance.now();
    const response = await fetch(url, { ...options, headers });
    const duration = Math.round(performance.now() - start);
    if (isDebug) {
        const statusColor = response.ok ? chalk.green : chalk.red;
        console.log(`${chalk.blue('←')} ${statusColor(response.status)} ${response.statusText} ${chalk.dim(`(${duration}ms)`)}`);
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
    }
    return response.json();
}
export async function fetchProjects(search = '', page = 1, limit = 10) {
    const apiUrl = getApiUrl();
    const query = new URLSearchParams({ search, page: page.toString(), limit: limit.toString() });
    return fetchWithAuth(`${apiUrl}/api/projects?${query.toString()}`);
}
export async function fetchEnvironments(projectId, search = '') {
    const apiUrl = getApiUrl();
    const query = new URLSearchParams({ projectId, search });
    return fetchWithAuth(`${apiUrl}/api/environments?${query.toString()}`);
}
export async function fetchVariables(environmentId) {
    const apiUrl = getApiUrl();
    const query = new URLSearchParams({ environmentId });
    return fetchWithAuth(`${apiUrl}/api/variables?${query.toString()}`);
}
export async function createEnvironment(name, projectId) {
    const apiUrl = getApiUrl();
    return fetchWithAuth(`${apiUrl}/api/environments`, {
        method: 'POST',
        body: JSON.stringify({ name, projectId })
    });
}
export async function createVariable(key, value, isSecret, environmentId) {
    const apiUrl = getApiUrl();
    return fetchWithAuth(`${apiUrl}/api/variables`, {
        method: 'POST',
        body: JSON.stringify({ key, value, isSecret, environmentId })
    });
}
export async function bulkCreateVariables(environmentId, variables) {
    const apiUrl = getApiUrl();
    return fetchWithAuth(`${apiUrl}/api/variables/bulk`, {
        method: 'POST',
        body: JSON.stringify({ environmentId, variables })
    });
}
