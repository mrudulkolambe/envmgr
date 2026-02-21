import chalk from 'chalk';
import figures from 'figures';
import fs from 'fs';
import path from 'path';
import { getApiUrl, getToken } from '../config/config.js';

export async function doctor() {
	console.log(chalk.bold('\nEnvMgr Diagnostics\n'));

	// 1. Check API URL
	const apiUrl = getApiUrl();
	if (!apiUrl) {
		console.log(`${chalk.red(figures.cross)} API URL not configured. Use ${chalk.cyan('envmgr configure')} to set it.`);
	} else {
		try {
			const res = await fetch(`${apiUrl}/api/health`, { method: 'HEAD' }).catch(() => null);
			if (res && res.ok) {
				console.log(`${chalk.green(figures.tick)} API reachable: ${chalk.dim(apiUrl)}`);
			} else {
				console.log(`${chalk.red(figures.cross)} API not reachable at ${chalk.dim(apiUrl)}`);
			}
		} catch (err) {
			console.log(`${chalk.red(figures.cross)} API not reachable at ${chalk.dim(apiUrl)}`);
		}
	}

	// 2. Check Token / Auth
	const token = getToken();
	if (!token) {
		console.log(`${chalk.red(figures.cross)} Not authenticated. Use ${chalk.cyan('envmgr login')} to sign in.`);
	} else {
		try {
			const res = await fetch(`${apiUrl}/api/auth/me`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			if (res.ok) {
				const data = await res.json();
				console.log(`${chalk.green(figures.tick)} Authenticated as ${chalk.cyan(data.data?.email || 'unknown user')}`);
			} else {
				console.log(`${chalk.red(figures.cross)} Token invalid or expired. Please login again.`);
			}
		} catch (err) {
			console.log(`${chalk.red(figures.cross)} Failed to verify authentication.`);
		}
	}

	// 3. Check Project Link
	const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
	let localConfig: any = null;
	if (!fs.existsSync(configPath)) {
		console.log(`${chalk.yellow(figures.warning)} No project linked in this directory.`);
	} else {
		try {
			localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
			console.log(`${chalk.green(figures.tick)} Project linked: ${chalk.cyan(localConfig.projectName)}`);

			// 4. Verify Environment
			if (apiUrl && token) {
				try {
					const res = await fetch(`${apiUrl}/api/environments?projectId=${localConfig.projectId}`, {
						headers: { 'Authorization': `Bearer ${token}` }
					});
					if (res.ok) {
						const envs = await res.json();
						const exists = envs.data.some((e: any) => e.id === localConfig.environmentId);
						if (exists) {
							console.log(`${chalk.green(figures.tick)} Environment exists: ${chalk.cyan(localConfig.environmentName)}`);
						} else {
							console.log(`${chalk.red(figures.cross)} Environment ${chalk.dim(localConfig.environmentName)} no longer exists or you lack access.`);
						}
					} else {
						console.log(`${chalk.red(figures.cross)} Failed to verify environment.`);
					}
				} catch (err) {
					console.log(`${chalk.red(figures.cross)} Failed to connect to API for environment verification.`);
				}
			}

			// 5. Check Env File Writable
			const envFilePath = path.join(process.cwd(), localConfig.envFilePath || '.env.local');
			try {
				if (fs.existsSync(envFilePath)) {
					fs.accessSync(envFilePath, fs.constants.W_OK);
					console.log(`${chalk.green(figures.tick)} Target file writable: ${chalk.dim(localConfig.envFilePath || '.env.local')}`);
				} else {
					// Check if directory is writable to create it
					fs.accessSync(path.dirname(envFilePath), fs.constants.W_OK);
					console.log(`${chalk.green(figures.tick)} Target location writable (file will be created): ${chalk.dim(localConfig.envFilePath || '.env.local')}`);
				}
			} catch (err) {
				console.log(`${chalk.red(figures.cross)} Target file not writable: ${chalk.dim(localConfig.envFilePath || '.env.local')}`);
			}

		} catch (err) {
			console.log(`${chalk.red(figures.cross)} Failed to read local config at .envmgr/config.json`);
		}
	}

	console.log('');
}
