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
    <Card className="p-4 space-y-4 h-full flex flex-col shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="space-y-1">
          <h2 className="font-semibold text-lg tracking-tight">Environment Variables</h2>
          <div className="text-sm text-muted-foreground">
            {selectedEnv ? `${selectedEnv.name} • ${ENV_TYPE_LABEL[selectedEnv.type]}` : 'No environment selected'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-md shadow-sm" onClick={handleCopyEnv} disabled={!selectedEnv}>
            <Copy className="size-4" />
            Copy .env
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-md shadow-sm" onClick={handleDownloadEnv} disabled={!selectedEnv}>
            <Download className="size-4" />
            Export
          </Button>
          <ImportDialog onImport={onImport} disabled={!selectedEnv} />
        </div>
      </div>

      {selectedEnv && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-md shadow-sm">
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
            className="rounded-md shadow-sm"
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
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-9 rounded-md shadow-sm"
            placeholder="Search variables..."
            value={varSearch}
            onChange={(e) => setVarSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 rounded-md shadow-sm"
          onClick={() => setVarSearch('')}
          title="Clear"
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        {selectedEnv ? (
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-[1fr_1.2fr_40px] items-center bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
              <div>Key</div>
              <div>Value</div>
              <div></div>
            </div>

            <div className="divide-y">
              {filteredVars.length === 0 && variables.length > 0 && (
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">
                  No variables match your search.
                </div>
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-16 h-16 mx-auto bg-muted rounded-md flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  No Environment Selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select an environment from the left panel to view and edit its variables.
                </p>
              </div>
            </div>
          </div>
        )}
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
