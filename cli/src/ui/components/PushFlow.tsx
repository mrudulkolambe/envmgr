import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import SelectInput from 'ink-select-input';
import { Screen } from './Screen.js';
import { bulkCreateVariables } from '../../api/service.js';
import fs from 'fs';
import path from 'path';

interface PushFlowProps {
	onCancel: () => void;
}

export const PushFlow: React.FC<PushFlowProps> = ({ onCancel }) => {
	const [status, setStatus] = useState<'reading' | 'confirm' | 'pushing' | 'success' | 'error'>('reading');
	const [error, setError] = useState<string | null>(null);
	const [config, setConfig] = useState<any>(null);
	const [variables, setVariables] = useState<{ key: string; value: string; isSecret: boolean }[]>([]);

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
				const parsed: { key: string; value: string; isSecret: boolean }[] = [];

				lines.forEach(line => {
					const trimmed = line.trim();
					if (!trimmed || trimmed.startsWith('#')) return;

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
			} catch (err: any) {
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
		} catch (err: any) {
			setError(err.message || 'Push failed');
			setStatus('error');
		}
	};

	return (
		<Screen>
			<Box flexDirection="column" marginTop={1}>
				<Text bold color="cyan">Push Local Variables</Text>
				
				{config && (
					<Box marginTop={1} flexDirection="column">
						<Text dimColor>Project: <Text color="green">{config.projectName}</Text></Text>
						<Text dimColor>Environment: <Text color="yellow">{config.environmentName}</Text></Text>
						<Text dimColor>Source File: <Text italic>{config.envFilePath}</Text></Text>
					</Box>
				)}

				<Box marginTop={1}>
					{status === 'reading' && <Text><Spinner type="dots" /> Reading local file...</Text>}
					
					{status === 'confirm' && (
						<Box flexDirection="column">
							<Text>Found <Text bold color="white">{variables.length}</Text> variables in your local file.</Text>
							<Text color="yellow">⚠️ This will update/create these variables on the remote server.</Text>
							<Box marginTop={1}>
								<Text bold>Are you sure you want to push?</Text>
							</Box>
							<Box marginTop={1}>
								<SelectInput 
									items={[
										{ label: 'Yes, push to remote', value: 'yes' },
										{ label: 'No, cancel', value: 'no' }
									]}
									onSelect={(item) => {
										if (item.value === 'yes') handleConfirm();
										else onCancel();
									}}
								/>
							</Box>
						</Box>
					)}

					{status === 'pushing' && (
						<Text color="yellow"><Spinner type="dots" /> Uploading {variables.length} variables to remote...</Text>
					)}

					{status === 'success' && (
						<Box flexDirection="column">
							<Text color="green" bold>✓ Successfully pushed {variables.length} variables!</Text>
							<Box marginTop={1}>
								<Text dimColor italic>Press any key to return to menu</Text>
							</Box>
						</Box>
					)}

					{status === 'error' && (
						<Box flexDirection="column">
							<Text color="red">Error: {error}</Text>
							<Box marginTop={1}>
								<Text dimColor italic>Press Escape to return to menu</Text>
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</Screen>
	);
};
