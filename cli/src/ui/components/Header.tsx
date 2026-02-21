import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';

export const Header: React.FC = () => {
	return (
		<Box flexDirection="column" marginBottom={1}>
			<Box flexDirection="row" alignItems="center">
				<Box borderStyle="round" borderColor="cyan" paddingX={2} marginRight={1}>
					<Gradient name="atlas">
						<Text bold>EnvMgr CLI</Text>
					</Gradient>
				</Box>
				<Box paddingX={1} borderStyle="single" borderColor="gray" borderDimColor>
					<Text dimColor italic>Premium Experience</Text>
				</Box>
			</Box>
			<Box marginTop={1} paddingX={1}>
				<Text dimColor>Management Console • Unified Dashboard</Text>
			</Box>
		</Box>
	);
};
