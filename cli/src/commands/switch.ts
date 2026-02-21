import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import figures from 'figures';
import { getApiUrl, getToken } from '../config/config.js';
import { fetchEnvironments } from '../api/service.js';

export async function handleSwitch(args: string[]) {
	const target = args[0];
	if (!target) {
		console.log(`${chalk.red(figures.cross)} Please specify an environment name or alias.`);
		console.log(`Usage: ${chalk.cyan('envmgr switch <environment|alias>')}`);
		process.exit(1);
	}

	const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
	if (!fs.existsSync(configPath)) {
		console.log(`${chalk.red(figures.cross)} No project linked in this directory. Use ${chalk.cyan('envmgr link')} first.`);
		process.exit(1);
	}

	let config: any;
	try {
		config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
	} catch (err) {
		console.log(`${chalk.red(figures.cross)} Failed to read .envmgr/config.json`);
		process.exit(1);
	}

	// Resolve alias
	let envName = target;
	if (config.envAliases && config.envAliases[target]) {
		envName = config.envAliases[target];
		console.log(`${chalk.dim(`Resolved alias ${chalk.cyan(target)} to ${chalk.cyan(envName)}`)}`);
	}

	const apiUrl = getApiUrl();
	const token = getToken();

	if (!apiUrl || !token) {
		console.log(`${chalk.red(figures.cross)} You must be logged in and configured to switch environments.`);
		process.exit(1);
	}

	try {
		console.log(`${chalk.blue(figures.play)} Searching for environment "${envName}"...`);
		const { data: envs } = await fetchEnvironments(config.projectId, envName);
		
		const matchedEnv = envs.find((e: any) => e.name.toLowerCase() === envName.toLowerCase());

		if (!matchedEnv) {
			console.log(`${chalk.red(figures.cross)} Environment "${envName}" not found in project "${config.projectName}".`);
			process.exit(1);
		}

		// Update config
		config.environmentId = matchedEnv.id;
		config.environmentName = matchedEnv.name;
		
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

		console.log(`${chalk.green(figures.tick)} Switched to environment: ${chalk.bold(matchedEnv.name)}`);
		console.log(`${chalk.dim(`Project: ${config.projectName}`)}`);
		console.log(`\nRun ${chalk.cyan('envmgr sync')} to update your local file.`);

	} catch (err: any) {
		console.log(`${chalk.red(figures.cross)} Failed to switch environment: ${err.message}`);
		process.exit(1);
	}
}
