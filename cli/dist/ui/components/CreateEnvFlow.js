import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { Screen } from './Screen.js';
import { ProjectPicker } from './ProjectPicker.js';
import { createEnvironment } from '../../api/service.js';
import fs from 'fs';
import path from 'path';
export const CreateEnvFlow = ({ onCancel }) => {
    const [step, setStep] = useState('project');
    const [selectedProject, setSelectedProject] = useState(null);
    const [envName, setEnvName] = useState('');
    const [error, setError] = useState(null);
    useEffect(() => {
        // Check if we already have a linked project to pre-select it
        try {
            const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                setSelectedProject({ id: config.projectId, name: config.projectName });
                setStep('name');
            }
        }
        catch (err) {
            // Ignore
        }
    }, []);
    useInput((input, key) => {
        if (step === 'success') {
            onCancel();
            return;
        }
        if (key.escape && step !== 'submitting') {
            onCancel();
            return;
        }
        // Fallback for some terminals where key.escape might not be detected
        if (input === '\u001b' && step !== 'submitting') {
            onCancel();
        }
    });
    const handleCreate = async () => {
        if (!selectedProject || !envName.trim())
            return;
        setStep('submitting');
        try {
            await createEnvironment(envName.trim(), selectedProject.id);
            setStep('success');
        }
        catch (err) {
            setError(err.message || 'Failed to create environment');
            setStep('error');
        }
    };
    return (_jsx(Screen, { children: _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { bold: true, color: "cyan", children: "Add New Environment" }), _jsxs(Box, { marginTop: 1, children: [step === 'project' && (_jsx(ProjectPicker, { onSelect: (p) => { setSelectedProject(p); setStep('name'); }, onCancel: onCancel })), step === 'name' && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { children: ["Project: ", _jsx(Text, { color: "green", children: selectedProject?.name })] }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { bold: true, children: "Environment Name: " }), _jsx(TextInput, { value: envName, onChange: setEnvName, onSubmit: handleCreate, placeholder: "e.g. staging, testing" })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Press Enter to create \u2022 Esc to cancel" }) })] })), step === 'submitting' && (_jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " Creating environment..."] })), step === 'success' && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "green", bold: true, children: ["\u2713 Environment \"", envName, "\" created successfully!"] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Press any key to return to menu" }) })] })), step === 'error' && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "red", children: ["Error: ", error] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Press Escape to go back" }) })] }))] })] }) }));
};
