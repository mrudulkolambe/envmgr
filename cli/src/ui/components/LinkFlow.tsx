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

type Step = 'project' | 'environment' | 'ask-alias' | 'confirm-file' | 'custom-file' | 'cloning' | 'ask-sync' | 'success' | 'error';

interface LinkFlowProps {
	onCancel: () => void;
	isSwitching?: boolean;
	onSyncRequest?: () => void;
}

export const LinkFlow: React.FC<LinkFlowProps> = ({ onCancel, isSwitching, onSyncRequest }) => {
	const [step, setStep] = useState<Step>(isSwitching ? 'environment' : 'project');
	const [selectedProject, setSelectedProject] = useState<{ id: string; name: string } | null>(null);
	const [selectedEnv, setSelectedEnv] = useState<{ id: string; name: string } | null>(null);
	const [alias, setAlias] = useState('');
	const [targetFile, setTargetFile] = useState('.env.local');
	const [customFileName, setCustomFileName] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [activeConfig, setActiveConfig] = useState<any>(null);

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
		} catch (err) {
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

	const handleProjectSelect = (project: { id: string; name: string }) => {
		setSelectedProject(project);
		setStep('environment');
	};

	const handleEnvSelect = (env: { id: string; name: string }) => {
		setSelectedEnv(env);
		if (isSwitching) {
			startCloning(targetFile, true, env, selectedProject || undefined);
		} else {
			setStep('ask-alias');
		}
	};

	const handleAliasSubmit = () => {
		if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
			setStep('confirm-file');
		} else {
			startCloning('.env.local');
		}
	};

	const startCloning = async (fileName: string, silent = false, envParam?: { id: string; name: string }, projectParam?: { id: string; name: string }) => {
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
			} else {
				// Original clone flow
				const { data: variables } = await fetchVariables(env.id);
				const content = variables.map((v: any) => `${v.key}=${v.value}`).join('\n');
				const filePath = path.join(process.cwd(), fileName);
				fs.writeFileSync(filePath, content);
				setStep('success');
			}
		} catch (err: any) {
			setError(err.message || 'Action failed');
			setStep('error');
		}
	};

	const renderContent = () => {
		switch (step) {
			case 'project':
				return <ProjectPicker onSelect={handleProjectSelect} onCancel={onCancel} activeId={activeConfig?.projectId} />;
			case 'environment':
				if (!selectedProject) return <Text color="yellow"><Spinner type="dots" /> Loading project context...</Text>;
				return <EnvironmentPicker 
							projectId={selectedProject.id} 
							projectName={selectedProject.name}
							onSelect={handleEnvSelect} 
							onCancel={() => isSwitching ? onCancel() : setStep('project')}
							activeId={selectedProject.id === activeConfig?.projectId ? activeConfig?.environmentId : undefined}
						/>;
			case 'ask-alias':
				return (
					<Box flexDirection="column">
						<Text bold color="cyan">Environment Alias (Optional)</Text>
						<Box marginTop={1}>
							<Text>Create a shortcut for {selectedEnv?.name}? (e.g. prod, stg)</Text>
						</Box>
						<Box marginTop={1}>
							<TextInput 
								value={alias} 
								onChange={setAlias} 
								onSubmit={handleAliasSubmit}
								placeholder="prod"
							/>
						</Box>
						<Box marginTop={1}>
							<Text dimColor>Press Enter to confirm or skip • Esc to cancel</Text>
						</Box>
					</Box>
				);
			case 'confirm-file':
				return (
					<Box flexDirection="column">
						<Text color="yellow">⚠️ .env.local already exists.</Text>
						<Text>Overwrite it?</Text>
						<Box marginTop={1}>
							<SelectInput 
								items={[
									{ label: 'Yes, overwrite', value: 'yes' },
									{ label: 'No, use a different file', value: 'no' },
									{ label: 'Cancel', value: 'cancel' }
								]}
								onSelect={(item) => {
									if (item.value === 'yes') startCloning('.env.local');
									else if (item.value === 'no') setStep('custom-file');
									else onCancel();
								}}
							/>
						</Box>
					</Box>
				);
			case 'ask-sync':
				return (
					<Box flexDirection="column">
						<Text color="green" bold>✓ Environment switched to {selectedEnv?.name}!</Text>
						<Box marginTop={1}>
							<Text>Do you want to sync variables now?</Text>
						</Box>
						<Box marginTop={1}>
							<SelectInput 
								items={[
									{ label: 'Yes, sync now', value: 'sync' },
									{ label: 'No, thanks', value: 'no' }
								]}
								onSelect={(item) => {
									if (item.value === 'sync') onSyncRequest?.();
									else onCancel();
								}}
							/>
						</Box>
					</Box>
				);
			case 'custom-file':
				return (
					<Box flexDirection="column">
						<Text bold>Enter filename for environment variables:</Text>
						<Box marginTop={1}>
							<TextInput 
								value={customFileName} 
								onChange={setCustomFileName} 
								onSubmit={() => startCloning(customFileName || '.env')}
								placeholder=".env.staging"
							/>
						</Box>
						<Box marginTop={1}>
							<Text dimColor>Press Enter to confirm • Esc to cancel</Text>
						</Box>
					</Box>
				);
			case 'cloning':
				return (
					<Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
						<Text color="yellow"><Spinner type="dots" /> {isSwitching ? 'Updating configuration...' : `Cloning variables to ${targetFile}...`}</Text>
					</Box>
				);
			case 'success':
				return (
					<Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
						<Text color="green" bold>✓ Successfully linked project!</Text>
						{alias && (
							<Box marginTop={1}>
								<Text>Alias <Text color="cyan" bold>{alias}</Text> created for <Text color="yellow">{selectedEnv?.name}</Text></Text>
							</Box>
						)}
						<Box marginTop={alias ? 0 : 1} flexDirection="column" alignItems="center">
							<Text dimColor>Variables cloned to {targetFile}</Text>
							<Text dimColor>Config saved to .envmgr/config.json</Text>
						</Box>
						<Box marginTop={1}>
							<Text dimColor italic>Press any key to return to menu</Text>
						</Box>
					</Box>
				);
			case 'error':
				return (
					<Box flexDirection="column">
						<Text color="red">Error: {error}</Text>
						<Box marginTop={1}>
							<SelectInput 
								items={[{ label: 'Retry', value: 'retry' }, { label: 'Go Back', value: 'back' }]}
								onSelect={(item) => item.value === 'retry' ? setStep(isSwitching ? 'environment' : 'project') : onCancel()}
							/>
						</Box>
					</Box>
				);
			default:
				return null;
		}
	};

	return (
		<Screen>
			<Box marginTop={1}>
				{renderContent()}
			</Box>
		</Screen>
	);
};
