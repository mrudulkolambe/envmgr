import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fetchVariables } from '../api/service.js';
export async function sync(options = {}) {
    try {
        const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
        if (!fs.existsSync(configPath)) {
            console.error(chalk.red('Error: No local configuration found. Please link a project first.'));
            process.exit(1);
        }
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const filePath = path.join(process.cwd(), config.envFilePath);
        if (options.dryRun) {
            console.log(chalk.bold(`\nDry Run: Syncing ${chalk.cyan(config.projectName)} (${chalk.yellow(config.environmentName)}) to ${chalk.dim(config.envFilePath)}\n`));
        }
        else {
            console.log(chalk.bold(`\nSyncing ${chalk.cyan(config.projectName)} (${chalk.yellow(config.environmentName)}) to ${chalk.dim(config.envFilePath)}...`));
        }
        const { data: remoteVars } = await fetchVariables(config.environmentId);
        const remoteMap = new Map();
        remoteVars.forEach((v) => remoteMap.set(v.key, v.value));
        const localMap = new Map();
        if (fs.existsSync(filePath)) {
            const localContent = fs.readFileSync(filePath, 'utf-8');
            localContent.split('\n').forEach(line => {
                const [key, ...rest] = line.split('=');
                if (key && key.trim()) {
                    localMap.set(key.trim(), rest.join('=').trim());
                }
            });
        }
        const added = [];
        const modified = [];
        const removed = [];
        const unchanged = [];
        remoteMap.forEach((value, key) => {
            if (!localMap.has(key)) {
                added.push(key);
            }
            else if (localMap.get(key) !== value) {
                modified.push(key);
            }
            else {
                unchanged.push(key);
            }
        });
        localMap.forEach((_, key) => {
            if (!remoteMap.has(key)) {
                removed.push(key);
            }
        });
        if (options.dryRun) {
            if (added.length === 0 && modified.length === 0 && removed.length === 0) {
                console.log(chalk.green('No changes detected. Local file is up to date.'));
            }
            else {
                added.forEach(key => console.log(`${chalk.green('+')} ${key}`));
                modified.forEach(key => console.log(`${chalk.yellow('~')} ${key}`));
                removed.forEach(key => console.log(`${chalk.red('-')} ${key}`));
                console.log(`\nSummary: ${chalk.green(added.length + ' added')}, ${chalk.yellow(modified.length + ' modified')}, ${chalk.red(removed.length + ' removed')}`);
                console.log(chalk.dim('\nThis was a dry run. No files were modified.'));
            }
        }
        else {
            const resolvedMap = new Map();
            const { select } = await import('@inquirer/prompts');
            // Process remote variables
            for (const [key, remoteValue] of remoteMap) {
                const localValue = localMap.get(key);
                if (localValue !== undefined && localValue !== remoteValue && process.stdout.isTTY) {
                    console.log(chalk.yellow(`\nConflict detected for ${chalk.bold(key)}`));
                    console.log(`${chalk.dim('  Local: ')} ${localValue}`);
                    console.log(`${chalk.dim('  Remote:')} ${remoteValue}`);
                    const choice = await select({
                        message: 'Action:',
                        choices: [
                            { name: 'Use remote', value: 'remote' },
                            { name: 'Keep local', value: 'local' },
                            { name: 'Skip', value: 'skip' }
                        ]
                    });
                    if (choice === 'remote')
                        resolvedMap.set(key, remoteValue);
                    else if (choice === 'local')
                        resolvedMap.set(key, localValue);
                    // skip = don't include in final map
                }
                else {
                    // No conflict or non-interactive: use remote value
                    resolvedMap.set(key, remoteValue);
                }
            }
            // Handle local-only variables (optional: user might want to keep them)
            const localOnly = Array.from(localMap.keys()).filter(key => !remoteMap.has(key));
            for (const key of localOnly) {
                if (process.stdout.isTTY) {
                    console.log(chalk.blue(`\nLocal-only variable found: ${chalk.bold(key)}`));
                    const choice = await select({
                        message: 'Action:',
                        choices: [
                            { name: 'Remove (Sync with remote)', value: 'remove' },
                            { name: 'Keep local-only', value: 'keep' }
                        ]
                    });
                    if (choice === 'keep')
                        resolvedMap.set(key, localMap.get(key));
                }
            }
            const content = Array.from(resolvedMap.entries())
                .map(([key, value]) => `${key}=${value}`)
                .join('\n');
            fs.writeFileSync(filePath, content);
            console.log(chalk.green('\n✓ Sync complete!'));
        }
        console.log('');
    }
    catch (err) {
        console.error(chalk.red(`\nError: ${err.message}`));
        process.exit(1);
    }
}
