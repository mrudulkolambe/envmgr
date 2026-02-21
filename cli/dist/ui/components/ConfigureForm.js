import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Screen } from './Screen.js';
import fs from 'fs';
import path from 'path';
export const ConfigureForm = ({ onSubmit, onCancel, defaultUrl, config, isLoggedIn, onEditProject }) => {
    const [step, setStep] = useState((isLoggedIn && config) ? 'choice' : 'hosted-choice');
    const [apiUrl, setApiUrl] = useState('');
    const [targetFile, setTargetFile] = useState(config?.envFilePath || '.env.local');
    const [error, setError] = useState(null);
    useInput((input, key) => {
        if (step === 'success') {
            onCancel();
            return;
        }
        if (key.escape || input === '\u001b') {
            onCancel();
        }
    });
    const handleChoiceSelect = (item) => {
        if (item.value === 'api')
            setStep('hosted-choice');
        else if (item.value === 'file')
            setStep('edit-file');
        else if (item.value === 'project')
            onEditProject?.();
        else
            onCancel();
    };
    const handleHostedSelect = (item) => {
        if (item.value === 'default') {
            onSubmit(defaultUrl);
            setStep('success');
        }
        else {
            setStep('custom-url');
        }
    };
    const handleUrlSubmit = () => {
        try {
            new URL(apiUrl);
            onSubmit(apiUrl);
            setStep('success');
        }
        catch {
            setError('Please enter a valid URL');
        }
    };
    const handleFileSubmit = () => {
        if (!targetFile) {
            setError('Please enter a filename');
            return;
        }
        try {
            const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
            const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            currentConfig.envFilePath = targetFile;
            fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
            setStep('success');
        }
        catch (err) {
            setError(err.message || 'Failed to update config');
        }
    };
    if (step === 'success') {
        return (_jsx(Screen, { children: _jsxs(Box, { flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, children: [_jsx(Text, { color: "green", bold: true, children: "\u2713 Configuration updated!" }), _jsx(Text, { dimColor: true, children: "Returning to menu..." })] }) }));
    }
    return (_jsx(Screen, { children: _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, color: "magenta", children: "Configure EnvMgr" }), step === 'choice' && (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { children: "What would you like to configure?" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                    { label: 'API Server URL', value: 'api' },
                                    { label: 'Target File (.env)', value: 'file' },
                                    { label: 'Project & Environment', value: 'project' },
                                    { label: 'Back', value: 'back' }
                                ], onSelect: handleChoiceSelect }) })] })), step === 'hosted-choice' && (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { children: "Which EnvMgr instance are you using?" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                    { label: 'Cloud (envmgr.vercel.app)', value: 'default' },
                                    { label: 'Self-hosted Instance', value: 'custom' },
                                ], onSelect: handleHostedSelect }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press Escape to go back" }) })] })), step === 'custom-url' && (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsxs(Box, { children: [_jsx(Text, { bold: true, children: "API URL:" }), _jsx(TextInput, { value: apiUrl, onChange: setApiUrl, onSubmit: handleUrlSubmit, placeholder: "https://api.your-instance.com" })] }), error && _jsx(Text, { color: "red", children: error }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press Escape to go back" }) })] })), step === 'edit-file' && (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsxs(Box, { children: [_jsx(Text, { bold: true, children: "Target File Path:" }), _jsx(TextInput, { value: targetFile, onChange: setTargetFile, onSubmit: handleFileSubmit, placeholder: ".env.local" })] }), error && _jsx(Text, { color: "red", children: error }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press Enter to save \u2022 Escape to go back" }) })] }))] }) }));
};
