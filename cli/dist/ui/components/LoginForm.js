import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { Screen } from './Screen.js';
export const LoginForm = ({ onSubmit, onCancel }) => {
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
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
        if ((key.escape || input === '\u001b') && step !== 'submitting') {
            onCancel();
        }
    });
    const handleEmailSubmit = () => {
        if (email)
            setStep('password');
    };
    const handlePasswordSubmit = async () => {
        if (password) {
            setStep('submitting');
            try {
                await onSubmit(email, password);
                setStep('success');
            }
            catch (err) {
                setError(err.message || 'Login failed');
                setStep('error');
            }
        }
    };
    if (step === 'success') {
        return (_jsx(Screen, { children: _jsxs(Box, { flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, children: [_jsx(Text, { color: "green", bold: true, children: "\u2713 Logged in successfully!" }), _jsxs(Text, { dimColor: true, children: ["Welcome back, ", email] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Returning to menu..." }) })] }) }));
    }
    return (_jsx(Screen, { children: _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "Login to your account" }), _jsxs(Box, { marginTop: 1, children: [_jsx(Box, { marginRight: 1, children: _jsx(Text, { bold: true, children: "Email:" }) }), step === 'email' ? (_jsx(TextInput, { value: email, onChange: setEmail, onSubmit: handleEmailSubmit })) : (_jsx(Text, { color: "gray", children: email }))] }), step !== 'email' && (_jsxs(Box, { children: [_jsx(Box, { marginRight: 1, children: _jsx(Text, { bold: true, children: "Password:" }) }), step === 'password' ? (_jsx(TextInput, { value: password, onChange: setPassword, onSubmit: handlePasswordSubmit, mask: "*" })) : (_jsx(Text, { color: "gray", children: "********" }))] })), _jsxs(Box, { marginTop: 1, children: [step === 'submitting' && (_jsx(Box, { children: _jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " Logging in..."] }) })), step === 'error' && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { color: "red", children: ["Error: ", error] }), _jsx(Text, { dimColor: true, children: "Press Enter to try again or Escape to cancel" })] }))] })] }) }));
};
