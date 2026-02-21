import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { fetchEnvironments } from '../../api/service.js';
export const EnvironmentPicker = ({ projectId, projectName, onSelect, onCancel, activeId }) => {
    const [envs, setEnvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function loadEnvs() {
            try {
                const res = await fetchEnvironments(projectId);
                setEnvs(res.data.map((e) => ({
                    label: e.id === activeId ? `${e.name} (active)` : e.name,
                    value: e.id
                })));
                setLoading(false);
            }
            catch (err) {
                setError(err.message || 'Failed to fetch environments');
                setLoading(false);
            }
        }
        loadEnvs();
    }, [projectId, activeId]);
    useInput((input, key) => {
        if (key.escape)
            onCancel();
    });
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { children: [_jsx(Text, { bold: true, color: "cyan", children: "Select Environment for " }), _jsx(Text, { bold: true, color: "yellow", children: projectName })] }), _jsx(Box, { marginTop: 1, flexDirection: "column", minHeight: 8, children: loading ? (_jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " Loading environments..."] })) : error ? (_jsxs(Text, { color: "red", children: ["Error: ", error] })) : envs.length === 0 ? (_jsx(Text, { dimColor: true, children: "No environments found" })) : (_jsx(SelectInput, { items: envs, onSelect: (item) => onSelect({ id: item.value, name: item.label }) })) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Esc to go back" }) })] }));
};
