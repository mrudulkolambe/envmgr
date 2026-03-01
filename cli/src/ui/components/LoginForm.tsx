import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { Screen } from './Screen.js';

interface LoginFormProps {
	onSubmit: (email: string, pass: string) => Promise<void>;
	onCancel: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onCancel }) => {
	const [step, setStep] = useState<'email' | 'password' | 'submitting' | 'success' | 'error'>('email');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);

	useInput((input, key) => {
		if (step === 'success') {
			onCancel();
			return;
		}

		if (step === 'error' && key.return) {
			setStep('password');
			setPassword('');
			setError(null);
			return;
		}

		if (key.tab || (key.ctrl && input === 'i')) {
			setStep(prev => (prev === 'email' ? 'password' : 'email'));
			return;
		}

		if ((key.escape || input === '\u001b') && step !== 'submitting') {
			onCancel();
		}
	});

	const handleEmailSubmit = () => {
		if (email) setStep('password');
	};

	const handlePasswordSubmit = async () => {
		if (password) {
			setStep('submitting');
			try {
				await onSubmit(email, password);
				setStep('success');
			} catch (err: any) {
				setError(err.message || 'Login failed');
				setStep('error');
			}
		}
	};

	if (step === 'success') {
		return (
			<Screen>
				<Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
					<Text color="green" bold>✓ Logged in successfully!</Text>
					<Text dimColor>Welcome back, {email}</Text>
					<Box marginTop={1}>
						<Text dimColor>Returning to menu...</Text>
					</Box>
				</Box>
			</Screen>
		);
	}

	return (
		<Screen>
			<Box flexDirection="column" marginTop={1}>
				<Text bold color="cyan">Login to Envmgr</Text>

				<Box marginTop={1} flexDirection="column">
					<Box flexDirection="row">
						<Text bold>Email: </Text>
						<TextInput
							value={email}
							onChange={setEmail}
							onSubmit={handleEmailSubmit}
							focus={step === 'email'}
							placeholder="you@example.com"
						/>
					</Box>
					<Box flexDirection="row" marginTop={1}>
						<Text bold>Password: </Text>
						<TextInput
							value={password}
							onChange={setPassword}
							onSubmit={handlePasswordSubmit}
							focus={step === 'password'}
							mask="*"
							placeholder="••••••••"
						/>
					</Box>
				</Box>

				{error && (
					<Box marginTop={1}>
						<Text color="red">⚠ {error}</Text>
					</Box>
				)}

				<Box marginTop={1}>
					{step === 'submitting' ? (
						<Text color="yellow">
							<Spinner type="dots" /> Logging in...
						</Text>
					) : (
						<Text dimColor>Press Tab(Space) to switch • Enter to confirm • Esc to cancel</Text>
					)}
				</Box>
			</Box>
		</Screen>
	);
};
