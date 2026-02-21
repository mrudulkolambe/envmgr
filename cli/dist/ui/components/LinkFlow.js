import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import fs from 'fs';
import path from 'path';
import { Screen } from './Screen.js';
import { ProjectPicker } from './ProjectPicker.js';
import { EnvironmentPicker } from './EnvironmentPicker.js';
import { fetchVariables } from '../../api/service.js';
export const LinkFlow = ({ onCancel, isSwitching, onSyncRequest }) => {
    const [step, setStep] = useState(isSwitching ? 'environment' : 'project');
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedEnv, setSelectedEnv] = useState(null);
    const [alias, setAlias] = useState('');
    const [targetFile, setTargetFile] = useState('.env.local');
    const [customFileName, setCustomFileName] = useState('');
    const [error, setError] = useState(null);
    const [activeConfig, setActiveConfig] = useState(null);
    React.useEffect(() => {
        try {
            const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                setActiveConfig(config);
                if (isSwitching) {
                    setSelectedProject({ id: config.projectId, name: config.projectName });
                    setTargetFile(config.envFilePath || '.env.local');
                }
            }
        }
        catch (err) {
            console.error('Failed to load project from config', err);
        }
    }, [isSwitching]);
    useInput((input, key) => {
        if (step === 'success') {
            onCancel();
            return;
        }
        if ((key.escape || input === '\u001b') && step !== 'cloning') {
            onCancel();
        }
    });
    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setStep('environment');
    };
    const handleEnvSelect = (env) => {
        setSelectedEnv(env);
        if (isSwitching) {
            startCloning(targetFile, true, env, selectedProject || undefined);
        }
        else {
            setStep('ask-alias');
        }
    };
    const handleAliasSubmit = () => {
        if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
            setStep('confirm-file');
        }
        else {
            startCloning('.env.local');
        }
    };
    const startCloning = async (fileName, silent = false, envParam, projectParam) => {
        const env = envParam || selectedEnv;
        const project = projectParam || selectedProject;
        if (!env || !project) {
            setError('Project or Environment not selected');
            setStep('error');
            return;
        }
        setTargetFile(fileName);
        setStep('cloning');
        try {
            const configDir = path.join(process.cwd(), '.envmgr');
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            const configPath = path.join(configDir, 'config.json');
            const localConfig = {
                ...(activeConfig || {}),
                projectId: project.id,
                projectName: project.name,
                environmentId: env.id,
                environmentName: env.name,
                envFilePath: fileName,
                envAliases: {
                    ...(activeConfig?.envAliases || {}),
                    ...(alias ? { [alias]: env.name } : {})
                }
            };
            fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2));
            if (isSwitching) {
                setStep('ask-sync');
            }
            else {
                // Original clone flow
                const { data: variables } = await fetchVariables(env.id);
                const content = variables.map((v) => `${v.key}=${v.value}`).join('\n');
                const filePath = path.join(process.cwd(), fileName);
                fs.writeFileSync(filePath, content);
                setStep('success');
            }
        }
        catch (err) {
            setError(err.message || 'Action failed');
            setStep('error');
        }
    };
    const renderContent = () => {
        switch (step) {
            case 'project':
                return _jsx(ProjectPicker, { onSelect: handleProjectSelect, onCancel: onCancel, activeId: activeConfig?.projectId });
            case 'environment':
                if (!selectedProject)
                    return _jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " Loading project context..."] });
                return _jsx(EnvironmentPicker, { projectId: selectedProject.id, projectName: selectedProject.name, onSelect: handleEnvSelect, onCancel: () => isSwitching ? onCancel() : setStep('project'), activeId: selectedProject.id === activeConfig?.projectId ? activeConfig?.environmentId : undefined });
            case 'ask-alias':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, color: "cyan", children: "Environment Alias (Optional)" }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { children: ["Create a shortcut for ", selectedEnv?.name, "? (e.g. prod, stg)"] }) }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: alias, onChange: setAlias, onSubmit: handleAliasSubmit, placeholder: "prod" }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press Enter to confirm or skip \u2022 Esc to cancel" }) })] }));
            case 'confirm-file':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "yellow", children: "\u26A0\uFE0F .env.local already exists." }), _jsx(Text, { children: "Overwrite it?" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                    { label: 'Yes, overwrite', value: 'yes' },
                                    { label: 'No, use a different file', value: 'no' },
                                    { label: 'Cancel', value: 'cancel' }
                                ], onSelect: (item) => {
                                    if (item.value === 'yes')
                                        startCloning('.env.local');
                                    else if (item.value === 'no')
                                        setStep('custom-file');
                                    else
                                        onCancel();
                                } }) })] }));
            case 'ask-sync':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "green", bold: true, children: ["\u2713 Environment switched to ", selectedEnv?.name, "!"] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { children: "Do you want to sync variables now?" }) }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [
                                    { label: 'Yes, sync now', value: 'sync' },
                                    { label: 'No, thanks', value: 'no' }
                                ], onSelect: (item) => {
                                    if (item.value === 'sync')
                                        onSyncRequest?.();
                                    else
                                        onCancel();
                                } }) })] }));
            case 'custom-file':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Enter filename for environment variables:" }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: customFileName, onChange: setCustomFileName, onSubmit: () => startCloning(customFileName || '.env'), placeholder: ".env.staging" }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press Enter to confirm \u2022 Esc to cancel" }) })] }));
            case 'cloning':
                return (_jsx(Box, { flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, children: _jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " ", isSwitching ? 'Updating configuration...' : `Cloning variables to ${targetFile}...`] }) }));
            case 'success':
                return (_jsxs(Box, { flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, children: [_jsx(Text, { color: "green", bold: true, children: "\u2713 Successfully linked project!" }), alias && (_jsx(Box, { marginTop: 1, children: _jsxs(Text, { children: ["Alias ", _jsx(Text, { color: "cyan", bold: true, children: alias }), " created for ", _jsx(Text, { color: "yellow", children: selectedEnv?.name })] }) })), _jsxs(Box, { marginTop: alias ? 0 : 1, flexDirection: "column", alignItems: "center", children: [_jsxs(Text, { dimColor: true, children: ["Variables cloned to ", targetFile] }), _jsx(Text, { dimColor: true, children: "Config saved to .envmgr/config.json" })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, italic: true, children: "Press any key to return to menu" }) })] }));
            case 'error':
                return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "red", children: ["Error: ", error] }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: [{ label: 'Retry', value: 'retry' }, { label: 'Go Back', value: 'back' }], onSelect: (item) => item.value === 'retry' ? setStep(isSwitching ? 'environment' : 'project') : onCancel() }) })] }));
            default:
                return null;
        }
    };
    return (_jsx(Screen, { children: _jsx(Box, { marginTop: 1, children: renderContent() }) }));
};
