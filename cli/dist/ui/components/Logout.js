import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Box, Text } from 'ink';
import { Screen } from './Screen.js';
export const Logout = ({ onComplete }) => {
    useEffect(() => {
        async function performLogout() {
            const { clearAll } = await import('../../config/config.js');
            clearAll();
            // Delay slightly to show the message
            setTimeout(onComplete, 1500);
        }
        performLogout();
    }, [onComplete]);
    return (_jsx(Screen, { children: _jsxs(Box, { flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, children: [_jsx(Text, { color: "red", bold: true, children: "Logging out..." }), _jsx(Text, { dimColor: true, children: "All configurations and tokens are being cleared." })] }) }));
};
