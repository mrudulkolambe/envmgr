import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { fetchProjects } from '../../api/service.js';
export const ProjectPicker = ({ onSelect, onCancel, activeId }) => {
    const [search, setSearch] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);
    const loadProjects = async () => {
        setLoading(true);
        try {
            const res = await fetchProjects(search, page, 5);
            setProjects(res.data.map((p) => ({
                label: p.id === activeId ? `${p.name} (active)` : p.name,
                value: p.id
            })));
            setTotalPages(res.pagination.totalPages);
            setLoading(false);
        }
        catch (err) {
            setError(err.message || 'Failed to fetch projects');
            setLoading(false);
        }
    };
    useEffect(() => {
        const timer = setTimeout(loadProjects, 300);
        return () => clearTimeout(timer);
    }, [search, page]);
    useInput((input, key) => {
        if (key.escape)
            onCancel();
        if (key.leftArrow && page > 1)
            setPage(p => p - 1);
        if (key.rightArrow && page < totalPages)
            setPage(p => p + 1);
    });
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, color: "cyan", children: "Select Project" }), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { bold: true, children: "Search: " }), _jsx(TextInput, { value: search, onChange: (val) => { setSearch(val); setPage(1); } })] }), _jsx(Box, { marginTop: 1, flexDirection: "column", minHeight: 8, children: loading ? (_jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " Loading projects..."] })) : error ? (_jsxs(Text, { color: "red", children: ["Error: ", error] })) : projects.length === 0 ? (_jsx(Text, { dimColor: true, children: "No projects found" })) : (_jsx(SelectInput, { items: projects, onSelect: (item) => onSelect({ id: item.value, name: item.label }) })) }), _jsxs(Box, { marginTop: 1, justifyContent: "space-between", children: [_jsxs(Text, { dimColor: true, children: ["Page ", page, " of ", totalPages] }), _jsx(Text, { dimColor: true, children: "\u2190 Prev \u2022 Next \u2192 \u2022 Esc to cancel" })] })] }));
};
