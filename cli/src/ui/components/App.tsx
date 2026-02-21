import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
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

type View = 'dashboard' | 'login' | 'configure' | 'status' | 'logout' | 'link' | 'sync' | 'create-env' | 'push';

interface AppProps {
	initialView?: View;
	isDryRun?: boolean;
	shouldExit?: boolean;
}

export const App: React.FC<AppProps> = ({ initialView = 'dashboard', isDryRun = false, shouldExit = false }) => {
	const [view, setView] = useState<View>(initialView);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isConfigured, setIsConfigured] = useState(false);
	const [isLinked, setIsLinked] = useState(false);
	const [localConfig, setLocalConfig] = useState<any>(null);
	const { exit } = useApp();

	const handleCancel = () => {
		if (shouldExit) {
			exit();
		} else {
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
				} catch (e) {
					console.error('Failed to parse config');
				}
			}
			setIsLinked(linked);
		}
		checkStatus();
	}, [view]);

	const handleAction = (item: { value: string }) => {
		if (item.value === 'exit') {
			exit();
			return;
		}
		setView(item.value as View);
	};

	const handleLogin = async (email: string, pass: string) => {
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

	const handleConfigure = async (apiUrl: string) => {
		const { setApiUrl } = await import('../../config/config.js');
		setApiUrl(apiUrl);
		// Wait a bit before returning to dashboard or exiting
		setTimeout(() => handleCancel(), 2000);
	};

	switch (view) {
		case 'login':
			return <LoginForm onSubmit={handleLogin} onCancel={handleCancel} />;
		case 'configure':
			return (
				<ConfigureForm 
					onSubmit={handleConfigure} 
					onCancel={handleCancel} 
					defaultUrl={DEFAULT_API_URL} 
					config={localConfig}
					isLoggedIn={isLoggedIn}
					onEditProject={() => setView('link')}
				/>
			);
		case 'status':
			return <Status onBack={handleCancel} />;
		case 'logout':
			return <Logout onComplete={handleCancel} />;
		case 'link':
			return <LinkFlow onCancel={handleCancel} isSwitching={isLinked} onSyncRequest={() => setView('sync')} />;
		case 'sync':
			return <SyncFlow onCancel={handleCancel} isDryRun={isDryRun} />;
		case 'create-env':
			return <CreateEnvFlow onCancel={handleCancel} />;
		case 'push':
			return <PushFlow onCancel={handleCancel} />;
		case 'dashboard':
		default:
			return <Dashboard onSelect={handleAction} isLoggedIn={isLoggedIn} isConfigured={isConfigured} isLinked={isLinked} />;
	}
};
