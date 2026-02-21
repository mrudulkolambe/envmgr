import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import fs from 'fs';
import path from 'path';
import { Screen } from './Screen.js';
import { fetchVariables } from '../../api/service.js';
export const SyncFlow = ({ onCancel, isDryRun = false }) => {
    const [status, setStatus] = useState('reading');
    const [error, setError] = useState(null);
    const [details, setDetails] = useState(null);
    const [diffs, setDiffs] = useState([]);
    useInput((input, key) => {
        if (status === 'success') {
            onCancel();
            return;
        }
        if ((key.escape || input === '\u001b') && status !== 'syncing') {
            onCancel();
        }
    });
    useEffect(() => {
        async function performSync() {
            try {
                const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
                if (!fs.existsSync(configPath)) {
                    throw new Error('No local configuration found. Please link a project first.');
                }
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                setDetails({
                    project: config.projectName,
                    env: config.environmentName,
                    file: config.envFilePath
                });
                setStatus('syncing');
                const { data: variables } = await fetchVariables(config.environmentId);
                const filePath = path.join(process.cwd(), config.envFilePath);
                if (isDryRun) {
                    const localVars = {};
                    if (fs.existsSync(filePath)) {
                        const fileContent = fs.readFileSync(filePath, 'utf-8');
                        fileContent.split('\n').forEach(line => {
                            const [key, ...val] = line.split('=');
                            if (key && key.trim()) {
                                localVars[key.trim()] = val.join('=').trim();
                            }
                        });
                    }
                    const calculatedDiffs = [];
                    const remoteKeys = new Set(variables.map((v) => v.key));
                    // Additions and Updates
                    variables.forEach((v) => {
                        if (!(v.key in localVars)) {
                            calculatedDiffs.push({ key: v.key, action: 'add', newValue: v.value });
                        }
                        else if (localVars[v.key] !== v.value) {
                            calculatedDiffs.push({ key: v.key, action: 'update', oldValue: localVars[v.key], newValue: v.value });
                        }
                    });
                    // Removals
                    Object.keys(localVars).forEach(key => {
                        if (!remoteKeys.has(key)) {
                            calculatedDiffs.push({ key, action: 'remove', oldValue: localVars[key] });
                        }
                    });
                    setDiffs(calculatedDiffs);
                }
                else {
                    const content = variables.map((v) => `${v.key}=${v.value}`).join('\n');
                    fs.writeFileSync(filePath, content);
                }
                setStatus('success');
            }
            catch (err) {
                setError(err.message || 'Sync failed');
                setStatus('error');
            }
        }
        performSync();
    }, []);
    return (_jsx(Screen, { children: _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "Synchronizing Variables" }), details && (_jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Text, { dimColor: true, children: ["Project: ", _jsx(Text, { color: "green", children: details.project })] }), _jsxs(Text, { dimColor: true, children: ["Environment: ", _jsx(Text, { color: "yellow", children: details.env })] }), _jsxs(Text, { dimColor: true, children: ["Target: ", _jsx(Text, { italic: true, children: details.file })] })] })), _jsxs(Box, { marginTop: 1, children: [status === 'reading' && _jsxs(Text, { children: [_jsx(Spinner, { type: "dots" }), " Reading local configuration..."] }), status === 'syncing' && _jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " Fetching remote variables and updating file..."] }), status === 'success' && (_jsxs(Box, { flexDirection: "column", children: [isDryRun ? (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "cyan", bold: true, children: "Dry Run Results (No files were changed):" }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: diffs.length === 0 ? (_jsx(Text, { dimColor: true, italic: true, children: "No changes detected. Local file is in sync." })) : (diffs.map((d, i) => (_jsxs(Box, { children: [_jsxs(Box, { width: 2, children: [d.action === 'add' && _jsx(Text, { color: "green", children: "+" }), d.action === 'update' && _jsx(Text, { color: "yellow", children: "~" }), d.action === 'remove' && _jsx(Text, { color: "red", children: "-" })] }), _jsx(Text, { bold: true, children: d.key }), d.action === 'update' && (_jsx(Text, { dimColor: true, children: " (changed)" }))] }, i)))) })] })) : (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "green", bold: true, children: "\u2713 Sync complete!" }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Your local file has been updated with the latest remote values." }) })] })), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Press any key to return to menu" }) })] })), status === 'error' && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "red", children: ["Error: ", error] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press Escape to return to menu" }) })] }))] })] }) }));
};
