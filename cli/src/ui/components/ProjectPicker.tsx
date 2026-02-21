import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { fetchProjects } from '../../api/service.js';

interface Project {
	id: string;
	name: string;
}

interface ProjectPickerProps {
	onSelect: (project: Project) => void;
	onCancel: () => void;
	activeId?: string;
}

export const ProjectPicker: React.FC<ProjectPickerProps> = ({ onSelect, onCancel, activeId }) => {
	const [search, setSearch] = useState('');
	const [projects, setProjects] = useState<{ label: string, value: string }[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [error, setError] = useState<string | null>(null);

	const loadProjects = async () => {
		setLoading(true);
		try {
			const res = await fetchProjects(search, page, 5);
			setProjects(res.data.map((p: any) => ({ 
				label: p.id === activeId ? `${p.name} (active)` : p.name, 
				value: p.id 
			})));
			setTotalPages(res.pagination.totalPages);
			setLoading(false);
		} catch (err: any) {
			setError(err.message || 'Failed to fetch projects');
			setLoading(false);
		}
	};

	useEffect(() => {
		const timer = setTimeout(loadProjects, 300);
		return () => clearTimeout(timer);
	}, [search, page]);

	useInput((input, key) => {
		if (key.escape) onCancel();
		if (key.leftArrow && page > 1) setPage(p => p - 1);
		if (key.rightArrow && page < totalPages) setPage(p => p + 1);
	});

	return (
		<Box flexDirection="column">
			<Text bold color="cyan">Select Project</Text>
			
			<Box marginTop={1}>
				<Text bold>Search: </Text>
				<TextInput value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
			</Box>

			<Box marginTop={1} flexDirection="column" minHeight={8}>
				{loading ? (
					<Text color="yellow"><Spinner type="dots" /> Loading projects...</Text>
				) : error ? (
					<Text color="red">Error: {error}</Text>
				) : projects.length === 0 ? (
					<Text dimColor>No projects found</Text>
				) : (
					<SelectInput 
						items={projects} 
						onSelect={(item) => onSelect({ id: item.value, name: item.label })} 
					/>
				)}
			</Box>

			<Box marginTop={1} justifyContent="space-between">
				<Text dimColor>Page {page} of {totalPages}</Text>
				<Text dimColor>← Prev • Next → • Esc to cancel</Text>
			</Box>
		</Box>
	);
};
