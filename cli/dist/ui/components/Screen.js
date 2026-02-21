import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { Header } from './Header.js';
export const Screen = ({ children }) => {
    return (_jsxs(Box, { flexDirection: "column", paddingX: 2, paddingY: 1, minHeight: 15, children: [_jsx(Header, {}), _jsx(Box, { flexGrow: 1, flexDirection: "row", borderStyle: "bold", borderLeft: true, borderRight: false, borderTop: false, borderBottom: false, borderColor: "cyan", paddingLeft: 1, marginLeft: 1, children: _jsx(Box, { flexGrow: 1, flexDirection: "column", children: children }) }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Box, { borderStyle: "single", borderTop: true, borderBottom: false, borderLeft: false, borderRight: false, borderColor: "gray" }), _jsxs(Box, { paddingX: 1, width: "100%", children: [_jsx(Box, { flexGrow: 1, children: _jsx(Text, { color: "gray", children: "Selection: Arrow Keys \u2022 Confirm: Enter \u2022 Quit: Ctrl+C" }) }), _jsx(Box, { children: _jsx(Text, { color: "cyan", bold: true, children: "EnvMgr v1.0.0" }) })] })] })] }));
};
