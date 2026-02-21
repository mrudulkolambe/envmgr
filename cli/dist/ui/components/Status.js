import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import fs from 'fs';
import path from 'path';
import { Screen } from './Screen.js';
export const Status = ({ onBack }) => {
    const [config, setConfig] = useState({ apiUrl: null, token: null, local: null });
    useInput((input, key) => {
        if (key.return || key.escape) {
            onBack();
        }
    });
    useEffect(() => {
        async function loadConfig() {
            const { getApiUrl, getToken } = await import('../../config/config.js');
            let local = null;
            try {
                const localConfigPath = path.join(process.cwd(), '.envmgr', 'config.json');
                if (fs.existsSync(localConfigPath)) {
                    local = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'));
                }
            }
            catch (err) {
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
    return (_jsx(Screen, { children: _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, color: "yellow", children: "System Status" }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Box, { children: [_jsx(Box, { width: 15, children: _jsx(Text, { bold: true, children: "API URL:" }) }), _jsx(Text, { color: config.apiUrl ? "green" : "red", children: config.apiUrl || "Not configured" })] }), _jsxs(Box, { children: [_jsx(Box, { width: 15, children: _jsx(Text, { bold: true, children: "Auth Status:" }) }), _jsx(Text, { color: config.token ? "green" : "red", children: config.token ? "Authenticated" : "Not logged in" })] })] }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { bold: true, color: "cyan", children: "Local Project Linkage" }), config.local && config.local.projectName ? (_jsxs(Box, { flexDirection: "column", marginLeft: 2, children: [_jsxs(Box, { children: [_jsx(Box, { width: 13, children: _jsx(Text, { bold: true, children: "Project:" }) }), _jsx(Text, { color: "green", children: config.local.projectName })] }), _jsxs(Box, { children: [_jsx(Box, { width: 13, children: _jsx(Text, { bold: true, children: "Environment:" }) }), _jsx(Text, { color: "yellow", children: config.local.environmentName })] }), _jsxs(Box, { children: [_jsx(Box, { width: 13, children: _jsx(Text, { bold: true, children: "Linked File:" }) }), _jsx(Text, { dimColor: true, children: config.local.envFilePath })] })] })) : (_jsx(Box, { marginLeft: 2, children: _jsx(Text, { dimColor: true, italic: true, children: "No project linked in this directory" }) }))] }), _jsx(Box, { marginTop: 2, children: _jsx(Text, { dimColor: true, children: "Press Enter to return to menu" }) })] }) }));
};
