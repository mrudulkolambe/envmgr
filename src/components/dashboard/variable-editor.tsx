'use client';

import React, { useState, useMemo } from 'react';
import { Search, Copy, Download, Trash2, Check, Plus, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Environment, EnvironmentType } from '@/types';
import { ImportDialog } from '@/components/dashboard/import-dialog';
import { EnvironmentSettingsDialog } from '@/components/dashboard/environment-settings-dialog';

type VariableRow = { key: string; value: string };

const ENV_TYPE_LABEL: Record<EnvironmentType, string> = {
  prod: 'Production',
  stage: 'Staging',
  dev: 'Development',
  test: 'Testing',
};

interface VariableEditorProps {
  selectedEnv: Environment | null;
  onVariableChange: (key: string, value: string) => void;
  onVariableDelete: (key: string) => void;
  onImport: (text: string) => void;
  onUpdateEnvironment: (updates: Partial<Environment>) => void;
  onDeleteEnvironment: () => void;
}

export function VariableEditor({ 
  selectedEnv, 
  onVariableChange, 
  onVariableDelete, 
  onImport,
  onUpdateEnvironment,
  onDeleteEnvironment
}: VariableEditorProps) {
  const [varSearch, setVarSearch] = useState('');

  const variables: VariableRow[] = useMemo(() => {
    if (!selectedEnv) return [];
    return Object.entries(selectedEnv.variables || {}).map(([key, value]) => ({ key, value }));
  }, [selectedEnv]);

  const filteredVars = useMemo(() => {
    if (!varSearch.trim()) return variables;
    const q = varSearch.toLowerCase();
    return variables.filter((v) => v.key.toLowerCase().includes(q) || String(v.value).toLowerCase().includes(q));
  }, [variables, varSearch]);

  function exportDotEnvText(vars: VariableRow[]) {
    return vars.map(({ key, value }) => `${key}=${escapeValue(value)}`).join('\n') + '\n';
  }

  function escapeValue(val: string) {
    if (/[\s#"']/g.test(val)) {
      const safe = val.replace(/"/g, '\\"');
      return `"${safe}"`;
    }
    return val;
  }

  function handleCopyEnv() {
    const text = exportDotEnvText(variables);
    navigator.clipboard.writeText(text);
  }

  function handleDownloadEnv() {
    const text = exportDotEnvText(variables);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEnv?.name ?? 'env'}.env`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="space-y-1">
          <div className="font-medium">Environment Variables</div>
          <div className="text-sm text-muted-foreground">
            {selectedEnv ? `${selectedEnv.name} • ${ENV_TYPE_LABEL[selectedEnv.type]}` : 'No environment selected'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyEnv} disabled={!selectedEnv}>
            <Copy className="size-4" />
            Copy .env
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadEnv} disabled={!selectedEnv}>
            <Download className="size-4" />
            Export
          </Button>
          <ImportDialog onImport={onImport} disabled={!selectedEnv} />
        </div>
      </div>

      {selectedEnv && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md">
          <div className="flex-1">
            <div className="font-medium text-sm">Environment Settings</div>
            <div className="text-xs text-muted-foreground">Manage this environment</div>
          </div>
          <EnvironmentSettingsDialog
            environment={selectedEnv}
            onUpdateEnvironment={onUpdateEnvironment}
            onDeleteEnvironment={onDeleteEnvironment}
          />
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => {
              if (confirm('Are you sure you want to delete this environment? This action cannot be undone.')) {
                onDeleteEnvironment();
              }
            }}
            disabled={!selectedEnv}
            title="Delete Environment"
          >
            Delete
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search variables..."
            value={varSearch}
            onChange={(e) => setVarSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() => setVarSearch('')}
          title="Clear"
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="grid grid-cols-[1fr_1.2fr_40px] items-center bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
          <div>Key</div>
          <div>Value</div>
          <div></div>
        </div>

        <div className="divide-y">
          {filteredVars.length === 0 && (
            <div className="px-3 py-6 text-sm text-muted-foreground">No variables found.</div>
          )}

          {filteredVars.map((row) => (
            <VariableRowItem
              key={row.key}
              row={row}
              onChange={onVariableChange}
              onDelete={onVariableDelete}
            />
          ))}

          <AddRow
            existingKeys={variables.map((v) => v.key)}
            onAdd={onVariableChange}
          />
        </div>
      </div>
    </Card>
  );
}

function VariableRowItem({
  row,
  onChange,
  onDelete,
}: {
  row: VariableRow;
  onChange: (key: string, value: string) => void;
  onDelete: (key: string) => void;
}) {
  const [value, setValue] = useState(row.value);
  const [dirty, setDirty] = useState(false);

  return (
    <div className="grid grid-cols-[1fr_1.2fr_40px] items-center px-3 py-2 gap-3">
      <div className="font-mono text-sm truncate">{row.key}</div>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setDirty(true);
          }}
          onBlur={() => {
            if (dirty) {
              onChange(row.key, value);
              setDirty(false);
            }
          }}
        />
        {dirty && <Check className="size-4 text-emerald-600" />}
      </div>
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="icon" onClick={() => onDelete(row.key)}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function AddRow({
  existingKeys,
  onAdd,
}: {
  existingKeys: string[];
  onAdd: (key: string, value: string) => void;
}) {
  const [k, setK] = useState('');
  const [v, setV] = useState('');
  const keyExists = existingKeys.includes(k.trim());
  const canAdd = k.trim().length > 0 && !keyExists;

  return (
    <div className="grid grid-cols-[1fr_1.2fr_40px] items-center px-3 py-2 gap-3 bg-muted/30">
      <Input
        placeholder="NEW_KEY"
        value={k}
        onChange={(e) => setK(e.target.value.toUpperCase())}
        className={cn(keyExists && 'border-destructive')}
      />
      <Input placeholder="value" value={v} onChange={(e) => setV(e.target.value)} />
      <div className="flex items-center justify-end">
        <Button
          size="icon"
          onClick={() => {
            if (!canAdd) return;
            onAdd(k.trim(), v);
            setK('');
            setV('');
          }}
          disabled={!canAdd}
          title={keyExists ? 'Key already exists' : 'Add variable'}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
