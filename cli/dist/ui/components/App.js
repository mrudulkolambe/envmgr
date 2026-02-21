import { jsx as _jsx } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useApp } from 'ink';
import fs from 'fs';
import path from 'path';
import { DEFAULT_API_URL } from '../../constants.js';
import { Dashboard } from './Dashboard.js';
import { LoginForm } from './LoginForm.js';
import { ConfigureForm } from './ConfigureForm.js';
import { Status } from './Status.js';
import { Logout } from './Logout.js';
import { LinkFlow } from './LinkFlow.js';
import { SyncFlow } from './SyncFlow.js';
import { CreateEnvFlow } from './CreateEnvFlow.js';
import { PushFlow } from './PushFlow.js';
export const App = ({ initialView = 'dashboard', isDryRun = false, shouldExit = false }) => {
    const [view, setView] = useState(initialView);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);
    const [isLinked, setIsLinked] = useState(false);
    const [localConfig, setLocalConfig] = useState(null);
    const { exit } = useApp();
    const handleCancel = () => {
        if (shouldExit) {
            exit();
        }
        else {
            setView('dashboard');
        }
    };
    React.useEffect(() => {
        async function checkStatus() {
            const { getToken, getApiUrl } = await import('../../config/config.js');
            setIsLoggedIn(!!getToken());
            setIsConfigured(!!getApiUrl());
            const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
            let linked = false;
            if (fs.existsSync(configPath)) {
                try {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                    setLocalConfig(config);
                    linked = !!config.projectId;
                }
                catch (e) {
                    console.error('Failed to parse config');
                }
            }
            setIsLinked(linked);
        }
        checkStatus();
    }, [view]);
    const handleAction = (item) => {
        if (item.value === 'exit') {
            exit();
            return;
        }
        setView(item.value);
    };
    const handleLogin = async (email, pass) => {
        const { requireApiConfig } = await import('../../config/guard.js');
        const { saveToken } = await import('../../config/config.js');
        const apiUrl = requireApiConfig();
        const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                password: pass,
                client: "cli",
            }),
        });
        const data = await res.json();
        if (!res.ok) {
            if (res.status === 401) {
                throw new Error('Incorrect email or password. Please try again.');
            }
            throw new Error(data.message || 'Login failed');
        }
        saveToken(data.data.token);
        // Wait a bit before returning to dashboard or exiting
        setTimeout(() => handleCancel(), 2000);
    };
    const handleConfigure = async (apiUrl) => {
        const { setApiUrl } = await import('../../config/config.js');
        setApiUrl(apiUrl);
        // Wait a bit before returning to dashboard or exiting
        setTimeout(() => handleCancel(), 2000);
    };
    switch (view) {
        case 'login':
            return _jsx(LoginForm, { onSubmit: handleLogin, onCancel: handleCancel });
        case 'configure':
            return (_jsx(ConfigureForm, { onSubmit: handleConfigure, onCancel: handleCancel, defaultUrl: DEFAULT_API_URL, config: localConfig, isLoggedIn: isLoggedIn, onEditProject: () => setView('link') }));
        case 'status':
            return _jsx(Status, { onBack: handleCancel });
        case 'logout':
            return _jsx(Logout, { onComplete: handleCancel });
        case 'link':
            return _jsx(LinkFlow, { onCancel: handleCancel, isSwitching: isLinked, onSyncRequest: () => setView('sync') });
        case 'sync':
            return _jsx(SyncFlow, { onCancel: handleCancel, isDryRun: isDryRun });
        case 'create-env':
            return _jsx(CreateEnvFlow, { onCancel: handleCancel });
        case 'push':
            return _jsx(PushFlow, { onCancel: handleCancel });
        case 'dashboard':
        default:
            return _jsx(Dashboard, { onSelect: handleAction, isLoggedIn: isLoggedIn, isConfigured: isConfigured, isLinked: isLinked });
    }
};
