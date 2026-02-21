import chalk from 'chalk';
import boxen from 'boxen';
export function help() {
    const usage = `
${chalk.bold('Usage:')}
  ${chalk.cyan('envmgr')} [command] [options]

${chalk.bold('Commands:')}
  ${chalk.green('link')}       Link current directory to an EnvMgr project (Interactive)
  ${chalk.green('switch')}     Switch environment using name or alias (e.g., envmgr switch prod)
  ${chalk.green('sync')}       Pull latest variables from remote to local file
  ${chalk.green('push')}       Push local variables from .env file to remote environment
  ${chalk.green('env create')} Add a new environment to a project
  ${chalk.green('var add')}    Add variables (single or bulk paste) to an environment
  ${chalk.green('status')}     Show current configuration and link status
  ${chalk.green('doctor')}     Run self-diagnostics to troubleshoot issues
  ${chalk.green('configure')}  Set API URL and global settings
  ${chalk.green('login')}      Authenticate with your EnvMgr account
  ${chalk.green('logout')}     Sign out and clear local credentials

${chalk.bold('Options:')}
  ${chalk.yellow('--json')}     Output status in machine-readable JSON format
  ${chalk.yellow('--dry-run')}  Preview sync changes without modifying files
  ${chalk.yellow('--debug')}    Show verbose API request/response logs
  ${chalk.yellow('--help')}     Show this help message

${chalk.bold('Examples:')}
  ${chalk.dim('$')} envmgr link
  ${chalk.dim('$')} envmgr switch prod
  ${chalk.dim('$')} envmgr sync --dry-run
  ${chalk.dim('$')} envmgr push
  ${chalk.dim('$')} envmgr status --json
	`;
    console.log(boxen(usage, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        title: 'EnvMgr CLI Help',
        titleAlignment: 'center'
    }));
}
