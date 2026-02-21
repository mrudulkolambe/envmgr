import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { Screen } from './Screen.js';

interface DashboardProps {
	onSelect: (item: { label: string; value: string }) => void;
	isLoggedIn: boolean;
	isConfigured: boolean;
	isLinked: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelect, isLoggedIn, isConfigured, isLinked }) => {
	const items = [
		isLoggedIn && isLinked && { label: 'Sync Variables', value: 'sync' },
		isLoggedIn && isLinked && { label: 'Push Variables', value: 'push' },
		isLoggedIn && isLinked && { label: 'Add Environment', value: 'create-env' },
		isLoggedIn && { label: isLinked ? 'Switch Environment' : 'Link Project', value: 'link' },
		isLoggedIn && { label: 'Status', value: 'status' },
		!isLoggedIn && isConfigured && { label: 'Login', value: 'login' },
		{ label: 'Configure', value: 'configure' },
		isLoggedIn && { label: 'Logout', value: 'logout' },
		{ label: 'Exit', value: 'exit' },
	].filter(Boolean) as { label: string; value: string }[];

	return (
		<Screen>
			<Box flexDirection="column" marginTop={1}>
				<Text bold color="yellow">Main Menu</Text>
				<Box marginTop={1}>
					<SelectInput items={items} onSelect={onSelect} />
				</Box>
			</Box>
		</Screen>
	);
};
