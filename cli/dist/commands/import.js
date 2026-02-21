import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import chalk from 'chalk';
import figures from 'figures';
import { bulkCreateVariables } from '../api/service.js';
export async function importVariables() {
    const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
    if (!fs.existsSync(configPath)) {
        console.log(`${chalk.red(figures.cross)} No project linked. Run ${chalk.cyan('envmgr link')} first.`);
        process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log(chalk.bold(`\nImport Variables to ${chalk.cyan(config.environmentName)}`));
    console.log(chalk.dim('Opening editor... Paste your variables in KEY=VALUE format, save and close.\n'));
    const tmpFile = path.join(os.tmpdir(), `.envmgr-import-${Date.now()}.env`);
    const initialContent = `# Paste your variables below (KEY=VALUE format)
# Lines starting with # are ignored
# Example:
# API_URL=https://api.example.com
# SECRET_KEY=12345
`;
    fs.writeFileSync(tmpFile, initialContent);
    const editor = process.env.EDITOR || (process.platform === 'win32' ? 'notepad' : 'vi');
    spawnSync(editor, [tmpFile], { stdio: 'inherit' });
    const content = fs.readFileSync(tmpFile, 'utf-8');
    fs.unlinkSync(tmpFile);
    const lines = content.split('\n');
    const variables = [];
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#'))
            return;
        let key = '', value = '';
        if (trimmed.includes('=')) {
            const [k, ...v] = trimmed.split('=');
            key = k.trim();
            value = v.join('=').trim();
        }
        else if (trimmed.includes(':')) {
            const [k, ...v] = trimmed.split(':');
            key = k.trim();
            value = v.join(':').trim();
        }
        if (key) {
            const isSecret = /SECRET|PASSWORD|TOKEN|KEY|AUTH|CREDENTIAL|PRIVATE/i.test(key);
            variables.push({ key, value, isSecret });
        }
    });
    if (variables.length === 0) {
        console.log(`${chalk.yellow(figures.warning)} No variables found. Canceled.`);
        return;
    }
    console.log(`${chalk.blue(figures.play)} Adding ${variables.length} variables...`);
    try {
        await bulkCreateVariables(config.environmentId, variables);
        console.log(`${chalk.green(figures.tick)} Successfully added ${chalk.bold(variables.length)} variables!`);
        console.log(`Run ${chalk.cyan('envmgr sync')} to update your local file.`);
    }
    catch (err) {
        console.log(`${chalk.red(figures.cross)} Failed to add variables: ${err.message}`);
    }
}
