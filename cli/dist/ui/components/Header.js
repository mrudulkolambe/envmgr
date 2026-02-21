import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
export const Header = () => {
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsxs(Box, { flexDirection: "row", alignItems: "center", children: [_jsx(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 2, marginRight: 1, children: _jsx(Gradient, { name: "atlas", children: _jsx(Text, { bold: true, children: "EnvMgr CLI" }) }) }), _jsx(Box, { paddingX: 1, borderStyle: "single", borderColor: "gray", borderDimColor: true, children: _jsx(Text, { dimColor: true, italic: true, children: "Premium Experience" }) })] }), _jsx(Box, { marginTop: 1, paddingX: 1, children: _jsx(Text, { dimColor: true, children: "Management Console \u2022 Unified Dashboard" }) })] }));
};
