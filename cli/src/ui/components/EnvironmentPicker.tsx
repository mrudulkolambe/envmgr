import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { fetchEnvironments } from '../../api/service.js';

interface Environment {
	id: string;
	name: string;
}

interface EnvironmentPickerProps {
	projectId: string;
	projectName: string;
	onSelect: (env: Environment) => void;
	onCancel: () => void;
	activeId?: string;
}

export const EnvironmentPicker: React.FC<EnvironmentPickerProps> = ({ projectId, projectName, onSelect, onCancel, activeId }) => {
	const [envs, setEnvs] = useState<{ label: string, value: string }[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadEnvs() {
			try {
				const res = await fetchEnvironments(projectId);
				setEnvs(res.data.map((e: any) => ({ 
					label: e.id === activeId ? `${e.name} (active)` : e.name, 
					value: e.id 
				})));
				setLoading(false);
			} catch (err: any) {
				setError(err.message || 'Failed to fetch environments');
				setLoading(false);
			}
		}
		loadEnvs();
	}, [projectId, activeId]);

	useInput((input, key) => {
		if (key.escape) onCancel();
	});

	return (
		<Box flexDirection="column">
			<Box>
				<Text bold color="cyan">Select Environment for </Text>
				<Text bold color="yellow">{projectName}</Text>
			</Box>

			<Box marginTop={1} flexDirection="column" minHeight={8}>
				{loading ? (
					<Text color="yellow"><Spinner type="dots" /> Loading environments...</Text>
				) : error ? (
					<Text color="red">Error: {error}</Text>
				) : envs.length === 0 ? (
					<Text dimColor>No environments found</Text>
				) : (
					<SelectInput 
						items={envs} 
						onSelect={(item) => onSelect({ id: item.value, name: item.label })} 
					/>
				)}
			</Box>

			<Box marginTop={1}>
				<Text dimColor>Esc to go back</Text>
			</Box>
		</Box>
	);
};
