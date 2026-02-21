import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { Screen } from './Screen.js';

interface LogoutProps {
	onComplete: () => void;
}

export const Logout: React.FC<LogoutProps> = ({ onComplete }) => {
	useEffect(() => {
		async function performLogout() {
			const { clearAll } = await import('../../config/config.js');
			clearAll();
			// Delay slightly to show the message
			setTimeout(onComplete, 1500);
		}
		performLogout();
	}, [onComplete]);

	return (
		<Screen>
			<Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
				<Text color="red" bold>Logging out...</Text>
				<Text dimColor>All configurations and tokens are being cleared.</Text>
			</Box>
		</Screen>
	);
};
