import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { VERSION } from '../../constants.js';
const LOGO = `
  ███████╗███╗   ██╗██╗   ██╗███╗   ███╗ ██████╗ ██████╗ 
  ██╔════╝████╗  ██║██║   ██║████╗ ████║██╔════╝ ██╔══██╗
  █████╗  ██╔██╗ ██║██║   ██║██╔████╔██║██║  ███╗██████╔╝
  ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝██║╚██╔╝██║██║   ██║██╔══██╗
  ███████╗██║ ╚████║ ╚████╔╝ ██║ ╚═╝ ██║╚██████╔╝██║  ██║
  ╚══════╝╚═╝  ╚═══╝  ╚═══╝  ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝`;
export const Header = () => {
    return (_jsxs(Box, { flexDirection: "column", marginBottom: 1, paddingX: 1, children: [_jsx(Box, { children: _jsx(Text, { color: "#34B27B", bold: true, children: LOGO }) }), _jsxs(Box, { marginTop: 1, paddingX: 2, flexDirection: "row", justifyContent: "space-between", width: 65, children: [_jsx(Text, { dimColor: true, bold: true, children: "WORKSPACE CONSOLE" }), _jsxs(Text, { dimColor: true, italic: true, children: ["Unified Management \u2022 v", VERSION] })] }), _jsx(Box, { borderStyle: "single", borderTop: true, borderBottom: false, borderLeft: false, borderRight: false, borderColor: "gray", borderDimColor: true, marginTop: 1, width: 65 })] }));
};
