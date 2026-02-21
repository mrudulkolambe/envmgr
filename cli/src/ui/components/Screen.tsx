import React from 'react';
import { Box, Text } from 'ink';
import { Header } from './Header.js';

interface ScreenProps {
	children: React.ReactNode;
}

export const Screen: React.FC<ScreenProps> = ({ children }) => {
	return (
		<Box flexDirection="column" paddingX={2} paddingY={1} minHeight={15}>
			<Header />
			
			<Box flexGrow={1} flexDirection="row" borderStyle="bold" borderLeft borderRight={false} borderTop={false} borderBottom={false} borderColor="cyan" paddingLeft={1} marginLeft={1}>
				<Box flexGrow={1} flexDirection="column">
					{children}
				</Box>
			</Box>

			<Box marginTop={1} flexDirection="column">
				<Box borderStyle="single" borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} borderColor="gray" />
				<Box paddingX={1} width="100%">
					<Box flexGrow={1}>
						<Text color="gray">Selection: Arrow Keys • Confirm: Enter • Quit: Ctrl+C</Text>
					</Box>
					<Box>
						<Text color="cyan" bold>EnvMgr v1.0.0</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

