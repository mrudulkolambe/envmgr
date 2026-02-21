#!/usr/bin/env node
import "dotenv/config";
import React from 'react';
import { render } from 'ink';
import { App } from './ui/components/App.js';
async function main() {
    const [command] = process.argv.slice(2);
    const args = process.argv.slice(2);
    const isJson = args.includes('--json');
    const isDebug = args.includes('--debug') || process.env.ENVMGR_DEBUG === '1';
    const isDryRun = args.includes('--dry-run');
    if (isDebug) {
        process.env.ENVMGR_DEBUG = '1';
    }
    const uiCommands = ['login', 'configure', 'link', 'sync', 'status', 'logout', 'create-env', 'push'];
    // Command mapping for convenience
    let activeCommand = command;
    if (command === 'env' && args[1] === 'create')
        activeCommand = 'create-env';
    if (command === 'var' && args[1] === 'add') {
        const { importVariables } = await import('./commands/import.js');
        await importVariables();
        process.exit(0);
    }
    const isHelp = args.includes('--help') || command === 'help';
    if (isHelp) {
        const { help } = await import('./commands/help.js');
        help();
        process.exit(0);
    }
    if (!activeCommand || uiCommands.includes(activeCommand)) {
        if (activeCommand === 'status' && (isJson || !process.stdout.isTTY)) {
            const { status } = await import('./commands/status.js');
            await status({ json: isJson });
        }
        else {
            const shouldExit = !!activeCommand;
            render(React.createElement(App, {
                initialView: activeCommand || 'dashboard',
                isDryRun,
                shouldExit
            }));
        }
    }
    else if (activeCommand === 'switch') {
        const { handleSwitch } = await import('./commands/switch.js');
        await handleSwitch(process.argv.slice(3));
    }
    else if (command === 'doctor') {
        const { doctor } = await import('./commands/doctor.js');
        await doctor();
    }
    else {
        console.log(`Unknown command: ${command}`);
        process.exit(1);
    }
}
main().catch((err) => {
    console.error("Unexpected error", err);
    process.exit(1);
});
