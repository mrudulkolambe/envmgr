import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import SelectInput from 'ink-select-input';
import { Screen } from './Screen.js';
import { bulkCreateVariables } from '../../api/service.js';
import fs from 'fs';
import path from 'path';
export const AddVarsFlow = ({ onCancel }) => {
    const [step, setStep] = useState('mode');
    const [inputContent, setInputContent] = useState('');
    const [error, setError] = useState(null);
    const [config, setConfig] = useState(null);
    const [parsedVars, setParsedVars] = useState([]);
    useEffect(() => {
        try {
            const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
            if (fs.existsSync(configPath)) {
                setConfig(JSON.parse(fs.readFileSync(configPath, 'utf-8')));
            }
        }
        catch (err) {
            setError('Failed to load project configuration');
            setStep('error');
        }
    }, []);
    useInput((input, key) => {
        if (step === 'success' || (step === 'error' && key.escape)) {
            onCancel();
        }
    });
    const parseVariables = (text) => {
        const lines = text.split('\n');
        const vars = [];
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                return;
            // Handle KEY=VALUE or KEY: VALUE
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
                // Basic heuristic for secrets: if key contains SECRET, KEY, PASS, TOKEN, etc.
                const isSecret = /SECRET|PASSWORD|TOKEN|KEY|AUTH|CREDENTIAL|PRIVATE/i.test(key);
                vars.push({ key, value, isSecret });
            }
        });
        return vars;
    };
    const handleSubmit = async () => {
        const vars = parseVariables(inputContent);
        if (vars.length === 0) {
            setError('No variables found in input. Use KEY=VALUE format.');
            setStep('error');
            return;
        }
        setParsedVars(vars);
        setStep('submitting');
        try {
            await bulkCreateVariables(config.environmentId, vars);
            setStep('success');
        }
        catch (err) {
            setError(err.message || 'Failed to add variables');
            setStep('error');
        }
    };
    return (_jsx(Screen, { children: _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Text, { bold: true, color: "cyan", children: ["Add Variables to ", config?.environmentName] }), _jsxs(Text, { dimColor: true, children: ["Project: ", config?.projectName] }), _jsxs(Box, { marginTop: 1, children: [step === 'mode' && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { children: "Select input mode:" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                            { label: 'Paste multiple variables (KEY=VALUE)', value: 'paste' },
                                            { label: 'Cancel', value: 'cancel' }
                                        ], onSelect: (item) => {
                                            if (item.value === 'paste')
                                                setStep('paste');
                                            else
                                                onCancel();
                                        } }) })] })), step === 'paste' && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Paste your variables below and press Enter twice to confirm:" }), _jsx(Box, { borderStyle: "round", borderColor: "dim", paddingX: 1, marginTop: 1, children: _jsx(TextInput, { value: inputContent, onChange: setInputContent, onSubmit: handleSubmit, placeholder: "DB_URL=postgres://...\nAPI_KEY=sk_test_..." }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Note: Secret status is automatically detected for keys like API_KEY, PASSWORD, etc." }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press Escape to cancel" }) })] })), step === 'submitting' && (_jsx(Box, { flexDirection: "column", children: _jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " Adding ", parsedVars.length, " variables..."] }) })), step === 'success' && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "green", bold: true, children: ["\u2713 ", parsedVars.length, " variables added successfully!"] }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [parsedVars.slice(0, 5).map((v, i) => (_jsxs(Text, { dimColor: true, children: ["  + ", v.key] }, i))), parsedVars.length > 5 && _jsxs(Text, { dimColor: true, children: ["  ... and ", parsedVars.length - 5, " more"] })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Press any key to return to menu" }) })] })), step === 'error' && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "red", children: ["Error: ", error] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Press Escape to go back" }) })] }))] })] }) }));
};
