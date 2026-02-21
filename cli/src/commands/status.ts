import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { getApiUrl, getToken } from '../config/config.js';

export async function status(options: { json?: boolean } = {}) {
	const apiUrl = getApiUrl();
	const token = getToken();
	
	let localConfig: any = null;
	try {
		const localConfigPath = path.join(process.cwd(), '.envmgr', 'config.json');
		if (fs.existsSync(localConfigPath)) {
			localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'));
		}
	} catch (err) {
		// Ignore
	}

	if (options.json) {
		const output = {
			authenticated: !!token,
			apiUrl: apiUrl || null,
			project: localConfig?.projectName || null,
			environment: localConfig?.environmentName || null,
			envFile: localConfig?.envFilePath || null
		};
		console.log(JSON.stringify(output, null, 2));
		return;
	}

	// Text-based status (for non-interactive shell usage)
	console.log(chalk.bold('\nEnvMgr Status\n'));
	console.log(`${chalk.bold('API URL:')} ${apiUrl ? chalk.green(apiUrl) : chalk.red('Not configured')}`);
	console.log(`${chalk.bold('Auth Status:')} ${token ? chalk.green('Authenticated') : chalk.red('Not logged in')}`);
	
	if (localConfig) {
		console.log(`\n${chalk.bold('Local Project Linkage')}`);
		console.log(`${chalk.bold('  Project:')} ${chalk.green(localConfig.projectName)}`);
		console.log(`${chalk.bold('  Environment:')} ${chalk.yellow(localConfig.environmentName)}`);
		console.log(`${chalk.bold('  Linked File:')} ${chalk.dim(localConfig.envFilePath)}`);
	} else {
		console.log(`\n${chalk.dim('No project linked in this directory')}`);
	}
	console.log('');
}
