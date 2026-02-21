import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { Screen } from './Screen.js';
export const Dashboard = ({ onSelect, isLoggedIn, isConfigured, isLinked }) => {
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
    ].filter(Boolean);
    return (_jsx(Screen, { children: _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, color: "yellow", children: "Main Menu" }), _jsx(Box, { marginTop: 1, children: _jsx(SelectInput, { items: items, onSelect: onSelect }) })] }) }));
};
