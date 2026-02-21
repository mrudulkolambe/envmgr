import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { Screen } from './Screen.js';
import { ProjectPicker } from './ProjectPicker.js';
import { createEnvironment } from '../../api/service.js';
import fs from 'fs';
import path from 'path';

interface CreateEnvFlowProps {
	onCancel: () => void;
}

export const CreateEnvFlow: React.FC<CreateEnvFlowProps> = ({ onCancel }) => {
	const [step, setStep] = useState<'project' | 'name' | 'submitting' | 'success' | 'error'>('project');
	const [selectedProject, setSelectedProject] = useState<{ id: string; name: string } | null>(null);
	const [envName, setEnvName] = useState('');
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Check if we already have a linked project to pre-select it
		try {
			const configPath = path.join(process.cwd(), '.envmgr', 'config.json');
			if (fs.existsSync(configPath)) {
				const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
				setSelectedProject({ id: config.projectId, name: config.projectName });
				setStep('name');
			}
		} catch (err) {
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
		if (!selectedProject || !envName.trim()) return;
		setStep('submitting');
		try {
			await createEnvironment(envName.trim(), selectedProject.id);
			setStep('success');
		} catch (err: any) {
			setError(err.message || 'Failed to create environment');
			setStep('error');
		}
	};

	return (
		<Screen>
			<Box marginTop={1} flexDirection="column">
				<Text bold color="cyan">Add New Environment</Text>

				<Box marginTop={1}>
					{step === 'project' && (
						<ProjectPicker 
							onSelect={(p) => { setSelectedProject(p); setStep('name'); }} 
							onCancel={onCancel} 
						/>
					)}

					{step === 'name' && (
						<Box flexDirection="column">
							<Text>Project: <Text color="green">{selectedProject?.name}</Text></Text>
							<Box marginTop={1}>
								<Text bold>Environment Name: </Text>
								<TextInput 
									value={envName} 
									onChange={setEnvName} 
									onSubmit={handleCreate}
									placeholder="e.g. staging, testing"
								/>
							</Box>
							<Box marginTop={1}>
								<Text dimColor italic>Press Enter to create • Esc to cancel</Text>
							</Box>
						</Box>
					)}

					{step === 'submitting' && (
						<Text color="yellow"><Spinner type="dots" /> Creating environment...</Text>
					)}

					{step === 'success' && (
						<Box flexDirection="column">
							<Text color="green" bold>✓ Environment "{envName}" created successfully!</Text>
							<Box marginTop={1}>
								<Text dimColor italic>Press any key to return to menu</Text>
							</Box>
						</Box>
					)}

					{step === 'error' && (
						<Box flexDirection="column">
							<Text color="red">Error: {error}</Text>
							<Box marginTop={1}>
								<Text dimColor italic>Press Escape to go back</Text>
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</Screen>
	);
};
