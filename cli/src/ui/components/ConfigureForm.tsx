import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Screen } from './Screen.js';

import fs from 'fs';
import path from 'path';

interface ConfigureFormProps {
	onSubmit: (apiUrl: string) => Promise<void>;
	onCancel: () => void;
	defaultUrl: string;
	config?: any;
	isLoggedIn?: boolean;
	onEditProject?: () => void;
}

export const ConfigureForm: React.FC<ConfigureFormProps> = ({ onSubmit, onCancel, defaultUrl, config, isLoggedIn, onEditProject }) => {
	const [step, setStep] = useState<'choice' | 'hosted-choice' | 'custom-url' | 'edit-file' | 'success'> (
		(isLoggedIn && config) ? 'choice' : 'hosted-choice'
	);
	const [apiUrl, setApiUrl] = useState('');
	const [targetFile, setTargetFile] = useState(config?.envFilePath || '.env.local');
	const [error, setError] = useState<string | null>(null);

	useInput((input, key) => {
		if (step === 'success') {
			onCancel();
			return;
		}
		if (key.escape || input === '\u001b') {
			onCancel();
		}
	});

	const handleChoiceSelect = (item: { value: string }) => {
		if (item.value === 'api') setStep('hosted-choice');
		else if (item.value === 'file') setStep('edit-file');
		else if (item.value === 'project') onEditProject?.();
		else onCancel();
	};

	const handleHostedSelect = (item: { value: string }) => {
		if (item.value === 'default') {
			onSubmit(defaultUrl);
			setStep('success');
		} else {
			setStep('custom-url');
		}
	};

	const handleUrlSubmit = () => {
		try {
			new URL(apiUrl);
			onSubmit(apiUrl);
			setStep('success');
		} catch {
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
		} catch (err: any) {
			setError(err.message || 'Failed to update config');
		}
	};

	if (step === 'success') {
		return (
			<Screen>
				<Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
					<Text color="green" bold>✓ Configuration updated!</Text>
					<Text dimColor>Returning to menu...</Text>
				</Box>
			</Screen>
		);
	}

	return (
		<Screen>
			<Box flexDirection="column" marginTop={1}>
				<Text bold color="magenta">Configure EnvMgr</Text>
				
				{step === 'choice' && (
					<Box flexDirection="column" marginTop={1}>
						<Text>What would you like to configure?</Text>
						<Box marginTop={1}>
							<SelectInput 
								items={[
									{ label: 'API Server URL', value: 'api' },
									{ label: 'Target File (.env)', value: 'file' },
									{ label: 'Project & Environment', value: 'project' },
									{ label: 'Back', value: 'back' }
								]} 
								onSelect={handleChoiceSelect} 
							/>
						</Box>
					</Box>
				)}

				{step === 'hosted-choice' && (
					<Box flexDirection="column" marginTop={1}>
						<Text>Which EnvMgr instance are you using?</Text>
						<Box marginTop={1}>
							<SelectInput 
								items={[
									{ label: 'Cloud (envmgr.vercel.app)', value: 'default' },
									{ label: 'Self-hosted Instance', value: 'custom' },
								]} 
								onSelect={handleHostedSelect} 
							/>
						</Box>
						<Box marginTop={1}>
							<Text dimColor>Press Escape to go back</Text>
						</Box>
					</Box>
				)}

				{step === 'custom-url' && (
					<Box flexDirection="column" marginTop={1}>
						<Box>
							<Text bold>API URL:</Text>
							<TextInput value={apiUrl} onChange={setApiUrl} onSubmit={handleUrlSubmit} placeholder="https://api.your-instance.com" />
						</Box>
						{error && <Text color="red">{error}</Text>}
						<Box marginTop={1}>
							<Text dimColor>Press Escape to go back</Text>
						</Box>
					</Box>
				)}

				{step === 'edit-file' && (
					<Box flexDirection="column" marginTop={1}>
						<Box>
							<Text bold>Target File Path:</Text>
							<TextInput value={targetFile} onChange={setTargetFile} onSubmit={handleFileSubmit} placeholder=".env.local" />
						</Box>
						{error && <Text color="red">{error}</Text>}
						<Box marginTop={1}>
							<Text dimColor>Press Enter to save • Escape to go back</Text>
						</Box>
					</Box>
				)}
			</Box>
		</Screen>
	);
};
