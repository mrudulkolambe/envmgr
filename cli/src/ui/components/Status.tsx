import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import fs from 'fs';
import path from 'path';
import { Screen } from './Screen.js';

interface LocalConfig {
	projectName?: string;
	environmentName?: string;
	envFilePath?: string;
}

export const Status: React.FC<{ onBack: () => void }> = ({ onBack }) => {
	const [config, setConfig] = useState<{ 
		apiUrl: string | null; 
		token: string | null;
		local: LocalConfig | null;
	}>({ apiUrl: null, token: null, local: null });

	useInput((input, key) => {
		if (key.return || key.escape) {
			onBack();
		}
	});

	useEffect(() => {
		async function loadConfig() {
			const { getApiUrl, getToken } = await import('../../config/config.js');
			
			let local: LocalConfig | null = null;
			try {
				const localConfigPath = path.join(process.cwd(), '.envmgr', 'config.json');
				if (fs.existsSync(localConfigPath)) {
					local = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'));
				}
			} catch (err) {
				// Ignore errors reading local config
			}

			setConfig({
				apiUrl: getApiUrl(),
				token: getToken(),
				local
			});
		}
		loadConfig();
	}, []);

	return (
		<Screen>
			<Box flexDirection="column" marginTop={1}>
				<Text bold color="yellow">System Status</Text>
				
				<Box marginTop={1} flexDirection="column">
					<Box>
						<Box width={15}>
							<Text bold>API URL:</Text>
						</Box>
						<Text color={config.apiUrl ? "green" : "red"}>
							{config.apiUrl || "Not configured"}
						</Text>
					</Box>
					<Box>
						<Box width={15}>
							<Text bold>Auth Status:</Text>
						</Box>
						<Text color={config.token ? "green" : "red"}>
							{config.token ? "Authenticated" : "Not logged in"}
						</Text>
					</Box>
				</Box>

				<Box marginTop={1} flexDirection="column">
					<Text bold color="cyan">Local Project Linkage</Text>
					{config.local && config.local.projectName ? (
						<Box flexDirection="column" marginLeft={2}>
							<Box>
								<Box width={13}>
									<Text bold>Project:</Text>
								</Box>
								<Text color="green">{config.local.projectName}</Text>
							</Box>
							<Box>
								<Box width={13}>
									<Text bold>Environment:</Text>
								</Box>
								<Text color="yellow">{config.local.environmentName}</Text>
							</Box>
							<Box>
								<Box width={13}>
									<Text bold>Linked File:</Text>
								</Box>
								<Text dimColor>{config.local.envFilePath}</Text>
							</Box>
						</Box>
					) : (
						<Box marginLeft={2}>
							<Text dimColor italic>No project linked in this directory</Text>
						</Box>
					)}
				</Box>

				<Box marginTop={2}>
					<Text dimColor>Press Enter to return to menu</Text>
				</Box>
			</Box>
		</Screen>
	);
};
