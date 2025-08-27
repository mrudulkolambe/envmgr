'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ImportDialogProps {
  onImport: (text: string) => void;
  disabled?: boolean;
}

export function ImportDialog({ onImport, disabled }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={disabled}>
          <Upload className="size-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Import .env</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 flex-1 overflow-hidden">
          <Label htmlFor="env-text">Paste .env content</Label>
          <Textarea
            id="env-text"
            placeholder={'KEY=value\nANOTHER="some value"'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="resize-none overflow-auto max-h-[300px] w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onImport(text);
              setOpen(false);
              setText('');
            }}
            disabled={!text.trim()}
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
