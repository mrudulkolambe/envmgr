import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import fs from 'fs';
import path from 'path';
import { Screen } from './Screen.js';
import { fetchVariables } from '../../api/service.js';

interface SyncFlowProps {
	onCancel: () => void;
	isDryRun?: boolean;
}

type Diff = { key: string; action: 'add' | 'update' | 'remove'; oldValue?: string; newValue?: string };

export const SyncFlow: React.FC<SyncFlowProps> = ({ onCancel, isDryRun = false }) => {
	const [status, setStatus] = useState<'reading' | 'syncing' | 'success' | 'error'>('reading');
	const [error, setError] = useState<string | null>(null);
	const [details, setDetails] = useState<{ project: string; env: string; file: string } | null>(null);
	const [diffs, setDiffs] = useState<Diff[]>([]);

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
					const localVars: Record<string, string> = {};
					if (fs.existsSync(filePath)) {
						const fileContent = fs.readFileSync(filePath, 'utf-8');
						fileContent.split('\n').forEach(line => {
							const [key, ...val] = line.split('=');
							if (key && key.trim()) {
								localVars[key.trim()] = val.join('=').trim();
							}
						});
					}

					const calculatedDiffs: Diff[] = [];
					const remoteKeys = new Set(variables.map((v: any) => v.key));

					// Additions and Updates
					variables.forEach((v: any) => {
						if (!(v.key in localVars)) {
							calculatedDiffs.push({ key: v.key, action: 'add', newValue: v.value });
						} else if (localVars[v.key] !== v.value) {
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
				} else {
					const content = variables.map((v: any) => `${v.key}=${v.value}`).join('\n');
					fs.writeFileSync(filePath, content);
				}

				setStatus('success');
			} catch (err: any) {
				setError(err.message || 'Sync failed');
				setStatus('error');
			}
		}

		performSync();
	}, []);

	return (
		<Screen>
			<Box flexDirection="column" marginTop={1}>
				<Text bold color="cyan">Synchronizing Variables</Text>
				
				{details && (
					<Box marginTop={1} flexDirection="column">
						<Text dimColor>Project: <Text color="green">{details.project}</Text></Text>
						<Text dimColor>Environment: <Text color="yellow">{details.env}</Text></Text>
						<Text dimColor>Target: <Text italic>{details.file}</Text></Text>
					</Box>
				)}

				<Box marginTop={1}>
					{status === 'reading' && <Text><Spinner type="dots" /> Reading local configuration...</Text>}
					{status === 'syncing' && <Text color="yellow"><Spinner type="dots" /> Fetching remote variables and updating file...</Text>}
					{status === 'success' && (
						<Box flexDirection="column">
							{isDryRun ? (
								<Box flexDirection="column">
									<Text color="cyan" bold>Dry Run Results (No files were changed):</Text>
									<Box marginTop={1} flexDirection="column">
										{diffs.length === 0 ? (
											<Text dimColor italic>No changes detected. Local file is in sync.</Text>
										) : (
											diffs.map((d, i) => (
												<Box key={i}>
													<Box width={2}>
														{d.action === 'add' && <Text color="green">+</Text>}
														{d.action === 'update' && <Text color="yellow">~</Text>}
														{d.action === 'remove' && <Text color="red">-</Text>}
													</Box>
													<Text bold>{d.key}</Text>
													{d.action === 'update' && (
														<Text dimColor> (changed)</Text>
													)}
												</Box>
											))
										)}
									</Box>
								</Box>
							) : (
								<Box flexDirection="column">
									<Text color="green" bold>✓ Sync complete!</Text>
									<Box marginTop={1}>
										<Text dimColor>Your local file has been updated with the latest remote values.</Text>
									</Box>
								</Box>
							)}
							<Box marginTop={1}>
								<Text dimColor italic>Press any key to return to menu</Text>
							</Box>
						</Box>
					)}
					{status === 'error' && (
						<Box flexDirection="column">
							<Text color="red">Error: {error}</Text>
							<Box marginTop={1}>
								<Text dimColor>Press Escape to return to menu</Text>
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</Screen>
	);
};
