/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Export/import for the whole working PaperContent tree, rendered at the
 * top of ContentTab. Export is a real file download (Blob + <a download>,
 * not the old read-only-`<pre>`-only "export"). Import accepts either a
 * picked file or pasted JSON text; both paths funnel through `applyImport`,
 * which does JSON.parse -> PaperContentSchema.safeParse -> on success calls
 * `onImport` (App.tsx's `updateField([], parsed)`, see CustomizerPanel/
 * ContentTab — an empty path replaces the whole tree via updateAtPath) and
 * on failure shows the parse error or the zod issue list inline, leaving
 * the current content completely untouched.
 */
import React, { useRef, useState } from 'react';
import { Download, Upload, ClipboardPaste, AlertTriangle, CheckCircle } from 'lucide-react';
import { PaperContentSchema, type PaperContent } from '../content/schema';

interface JsonImportExportProps {
  content: PaperContent;
  slug: string;
  onImport: (content: PaperContent) => void;
}

type ImportState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'json-error'; message: string }
  | { status: 'schema-error'; issues: { path: string; message: string }[] };

export const JsonImportExport: React.FC<JsonImportExportProps> = ({ content, slug, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteText, setPasteText] = useState('');
  const [state, setState] = useState<ImportState>({ status: 'idle' });

  const handleExport = () => {
    const json = JSON.stringify(content, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const applyImport = (raw: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      setState({ status: 'json-error', message: e instanceof Error ? e.message : 'Could not parse JSON' });
      return;
    }

    const result = PaperContentSchema.safeParse(parsed);
    if (!result.success) {
      setState({
        status: 'schema-error',
        issues: result.error.issues.map((issue) => ({
          path: issue.path.length ? issue.path.join('.') : '(root)',
          message: issue.message,
        })),
      });
      return;
    }

    onImport(result.data);
    setState({ status: 'success' });
    setPasteText('');
    setTimeout(() => setState((s) => (s.status === 'success' ? { status: 'idle' } : s)), 2500);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyImport(String(reader.result ?? ''));
    reader.readAsText(file);
    e.target.value = ''; // allow re-picking the same file (e.g. re-import after a fix)
  };

  return (
    <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border space-y-2.5">
      <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted flex items-center gap-1.5">
        <Download size={11} className="text-theme-accent" />
        Import / Export Content JSON
      </h4>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-theme-border hover:bg-theme-bg text-[10px] font-semibold text-theme-main transition-colors"
        >
          <Download size={11} /> Export JSON
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-theme-border hover:bg-theme-bg text-[10px] font-semibold text-theme-main transition-colors"
        >
          <Upload size={11} /> Import File
        </button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFilePick} className="hidden" />
      </div>

      <div>
        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase flex items-center gap-1">
          <ClipboardPaste size={10} /> Or Paste JSON
        </label>
        <textarea
          rows={3}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste a full PaperContent JSON document..."
          spellCheck={false}
          className="w-full p-2 text-[10px] font-mono rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
        />
        <button
          type="button"
          disabled={!pasteText.trim()}
          onClick={() => applyImport(pasteText)}
          className="mt-1.5 w-full py-1.5 rounded-lg border border-dashed border-theme-accent/40 text-theme-accent hover:bg-theme-accent/5 text-[10px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Import Pasted JSON
        </button>
      </div>

      {state.status === 'success' && (
        <p className="text-[10px] text-green-600 flex items-center gap-1">
          <CheckCircle size={11} /> Imported successfully.
        </p>
      )}
      {state.status === 'json-error' && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] text-red-500 flex items-start gap-1.5">
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          <span>Invalid JSON: {state.message}</span>
        </div>
      )}
      {state.status === 'schema-error' && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-[10px] text-red-500 max-h-32 overflow-y-auto space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle size={12} className="flex-shrink-0" /> Doesn't match the paper content schema:
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {state.issues.map((issue, i) => (
              <li key={i}>
                <span className="font-mono">{issue.path}</span>: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
