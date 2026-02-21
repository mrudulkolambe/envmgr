import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import SelectInput from 'ink-select-input';
import { Screen } from './Screen.js';
import { bulkCreateVariables } from '../../api/service.js';
import fs from 'fs';
import path from 'path';
export const PushFlow = ({ onCancel }) => {
    const [status, setStatus] = useState('reading');
    const [error, setError] = useState(null);
    const [config, setConfig] = useState(null);
    const [variables, setVariables] = useState([]);
    useEffect(() => {
        async function loadAndParse() {
            try {
                const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
                if (!fs.existsSync(configPath)) {
                    throw new Error('No local configuration found. Please link a project first.');
                }
                const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                setConfig(localConfig);
                const filePath = path.join(process.cwd(), localConfig.envFilePath || '.env.local');
                if (!fs.existsSync(filePath)) {
                    throw new Error(`Local file ${localConfig.envFilePath} not found.`);
                }
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n');
                const parsed = [];
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith('#'))
                        return;
                    if (trimmed.includes('=')) {
                        const [k, ...v] = trimmed.split('=');
                        const key = k.trim();
                        const value = v.join('=').trim();
                        if (key) {
                            const isSecret = /SECRET|PASSWORD|TOKEN|KEY|AUTH|CREDENTIAL|PRIVATE/i.test(key);
                            parsed.push({ key, value, isSecret });
                        }
                    }
                });
                if (parsed.length === 0) {
                    throw new Error('No variables found in local file.');
                }
                setVariables(parsed);
                setStatus('confirm');
            }
            catch (err) {
                setError(err.message || 'Failed to read local variables');
                setStatus('error');
            }
        }
        loadAndParse();
    }, []);
    useInput((input, key) => {
        if (status === 'success' || (status === 'error' && key.escape)) {
            onCancel();
        }
    });
    const handleConfirm = async () => {
        setStatus('pushing');
        try {
            await bulkCreateVariables(config.environmentId, variables);
            setStatus('success');
        }
        catch (err) {
            setError(err.message || 'Push failed');
            setStatus('error');
        }
    };
    return (_jsx(Screen, { children: _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "Push Local Variables" }), config && (_jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Text, { dimColor: true, children: ["Project: ", _jsx(Text, { color: "green", children: config.projectName })] }), _jsxs(Text, { dimColor: true, children: ["Environment: ", _jsx(Text, { color: "yellow", children: config.environmentName })] }), _jsxs(Text, { dimColor: true, children: ["Source File: ", _jsx(Text, { italic: true, children: config.envFilePath })] })] })), _jsxs(Box, { marginTop: 1, children: [status === 'reading' && _jsxs(Text, { children: [_jsx(Spinner, { type: "dots" }), " Reading local file..."] }), status === 'confirm' && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { children: ["Found ", _jsx(Text, { bold: true, color: "white", children: variables.length }), " variables in your local file."] }), _jsx(Text, { color: "yellow", children: "\u26A0\uFE0F This will update/create these variables on the remote server." }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { bold: true, children: "Are you sure you want to push?" }) }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                            { label: 'Yes, push to remote', value: 'yes' },
                                            { label: 'No, cancel', value: 'no' }
                                        ], onSelect: (item) => {
                                            if (item.value === 'yes')
                                                handleConfirm();
                                            else
                                                onCancel();
                                        } }) })] })), status === 'pushing' && (_jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " Uploading ", variables.length, " variables to remote..."] })), status === 'success' && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "green", bold: true, children: ["\u2713 Successfully pushed ", variables.length, " variables!"] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Press any key to return to menu" }) })] })), status === 'error' && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "red", children: ["Error: ", error] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Press Escape to return to menu" }) })] }))] })] }) }));
};
