import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';

const LOGO = `
  ███████╗███╗   ██╗██╗   ██╗███╗   ███╗ ██████╗ ██████╗ 
  ██╔════╝████╗  ██║██║   ██║████╗ ████║██╔════╝ ██╔══██╗
  █████╗  ██╔██╗ ██║██║   ██║██╔████╔██║██║  ███╗██████╔╝
  ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝██║╚██╔╝██║██║   ██║██╔══██╗
  ███████╗██║ ╚████║ ╚████╔╝ ██║ ╚═╝ ██║╚██████╔╝██║  ██║
  ╚══════╝╚═╝  ╚═══╝  ╚═══╝  ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝`;

export const Header: React.FC = () => {
	return (
		<Box flexDirection="column" marginBottom={1} paddingX={1}>
			<Box>
				<Text color="#34B27B" bold>{LOGO}</Text>
			</Box>
			<Box marginTop={1} paddingX={2} flexDirection="row" justifyContent="space-between" width={65}>
				<Text dimColor bold>WORKSPACE CONSOLE</Text>
				<Text dimColor italic>Unified Management • v1.0.0</Text>
			</Box>
			<Box borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false} borderColor="gray" borderDimColor marginTop={1} width={65} />
		</Box>
	);
};
