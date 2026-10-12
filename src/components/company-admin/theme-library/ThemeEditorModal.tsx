import React, { useState } from 'react';
import { 
  X, RotateCcw, Undo2, Redo2, Smartphone, Monitor, LayoutGrid, Plus, Check, AlertTriangle, Crown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminTheme, PreviewMode } from './types';
import { SharedThemePreview } from './SharedThemePreview';

interface ThemeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Resolves true once saved; the editor stays open with the draft if saving fails. */
  onSave: (theme: AdminTheme) => Promise<boolean>;
  initialTheme?: AdminTheme | null;
  mode: 'create' | 'edit';
}

const defaultTheme: AdminTheme = {
  id: '',
  name: '',
  tagline: '',
  categories: ['Restaurant'],
  primary: '#090A0C',
  secondary: '#1C1E22',
  accent: '#FB8500',
  isPremium: false,
  downloads: 0,
};

function ThemeEditorModalContent({
  onClose,
  onSave,
  initialTheme,
  mode,
}: ThemeEditorModalProps) {
  const [draft, setDraft] = useState<AdminTheme>(() => (initialTheme ? { ...initialTheme } : { ...defaultTheme }));
  const [catInput, setCatInput] = useState('');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('mobile');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Undo / Redo history
  const [history, setHistory] = useState<AdminTheme[]>(() => [initialTheme ? { ...initialTheme } : { ...defaultTheme }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = (newDraft: AdminTheme) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, newDraft]);
    setHistoryIndex(updatedHistory.length);
    setDraft(newDraft);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setDraft(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setDraft(history[nextIndex]);
    }
  };

  const handleReset = () => {
    const original = initialTheme ? { ...initialTheme } : { ...defaultTheme };
    pushHistory(original);
  };

  const hasUnsavedChanges = () => {
    const reference = initialTheme || defaultTheme;
    return (
      draft.name !== reference.name ||
      (draft.tagline || '') !== (reference.tagline || '') ||
      draft.primary !== reference.primary ||
      draft.secondary !== reference.secondary ||
      draft.accent !== reference.accent ||
      draft.isPremium !== reference.isPremium ||
      JSON.stringify(draft.categories) !== JSON.stringify(reference.categories)
    );
  };

  const handleAttemptClose = () => {
    if (hasUnsavedChanges()) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleAddCategory = () => {
    if (catInput.trim() && !draft.categories.includes(catInput.trim())) {
      pushHistory({
        ...draft,
        categories: [...draft.categories, catInput.trim()],
      });
      setCatInput('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    pushHistory({
      ...draft,
      categories: draft.categories.filter((c) => c !== cat),
    });
  };

  const handleColorChange = (key: 'primary' | 'secondary' | 'accent', val: string) => {
    pushHistory({
      ...draft,
      [key]: val,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || saving) return;

    const themeToSave: AdminTheme = {
      ...draft,
      name: draft.name.trim(),
      tagline: (draft.tagline || '').trim(),
    };

    setSaving(true);
    try {
      if (await onSave(themeToSave)) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-5xl rounded-3xl shadow-2xl border border-border/70 overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {mode === 'create' ? 'Create New Theme' : `Edit Theme: ${draft.name}`}
            </h2>
            {draft.isPremium ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                PRO
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                Free
              </span>
            )}
          </div>

          {/* History Controls & Close */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Reset changes"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-border/60 mx-1" />
            <button
              type="button"
              onClick={handleAttemptClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Form + Live Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
          {/* Left Column: Theme Configuration Form (5 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-5 p-5 sm:p-6 space-y-5">
            {/* Theme Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Theme Name *
              </label>
              <Input
                placeholder="e.g. Midnight Ember"
                value={draft.name}
                onChange={(e) => pushHistory({ ...draft, name: e.target.value })}
                required
                maxLength={60}
                className="bg-muted/30 border-border/60"
              />
            </div>

            {/* Tagline shown on shop owners' theme cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Tagline
              </label>
              <Input
                placeholder="e.g. Warm, bold, and energetic."
                value={draft.tagline || ''}
                onChange={(e) => pushHistory({ ...draft, tagline: e.target.value })}
                maxLength={120}
                className="bg-muted/30 border-border/60"
              />
            </div>

            {/* Pro vs Free Tier Toggle */}
            <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Theme Tier
                  </span>
                  {draft.isPremium ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                      PRO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                      Free
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {draft.isPremium
                    ? 'Restricted to PRO restaurant subscribers'
                    : 'Available to all standard and free restaurants'}
                </p>
              </div>

              <div className="flex items-center p-1 rounded-xl bg-card border border-border/60 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => pushHistory({ ...draft, isPremium: false })}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    !draft.isPremium
                      ? 'bg-muted text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => pushHistory({ ...draft, isPremium: true })}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    draft.isPremium
                      ? 'bg-amber-500 text-amber-950 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  PRO
                </button>
              </div>
            </div>

            {/* Categories Tag Manager */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Recommended Categories
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Seafood, Cafe"
                  value={catInput}
                  onChange={(e) => setCatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className="bg-muted/30 border-border/60"
                />
                <Button type="button" onClick={handleAddCategory} variant="secondary" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {draft.categories && draft.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {draft.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-foreground border border-border/50"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Colors Section: Primary, Secondary, Accent */}
            <div className="space-y-3 pt-2 border-t border-border/40">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Color Palette Tokens
              </label>

              {/* Primary Color */}
              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-foreground block">Primary (Background)</span>
                  <span className="text-[11px] text-muted-foreground">Used for page layout (60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draft.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={draft.primary.toUpperCase()}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-20 font-mono text-xs text-foreground bg-card border border-border/60 rounded-md px-2 py-1 uppercase"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-foreground block">Secondary (Surfaces)</span>
                  <span className="text-[11px] text-muted-foreground">Used for cards & containers (30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draft.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={draft.secondary.toUpperCase()}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-20 font-mono text-xs text-foreground bg-card border border-border/60 rounded-md px-2 py-1 uppercase"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-semibold text-xs text-foreground block">Accent (Highlights)</span>
                  <span className="text-[11px] text-muted-foreground">Used for buttons & prices (10%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draft.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={draft.accent.toUpperCase()}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-20 font-mono text-xs text-foreground bg-card border border-border/60 rounded-md px-2 py-1 uppercase"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Right Column: Live Interactive Preview (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 bg-muted/10 flex flex-col h-full overflow-hidden">
            {/* Preview Mode Switcher */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Live Preview
              </span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border/60 shadow-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewMode === 'mobile'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewMode === 'desktop'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('components')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewMode === 'components'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Components
                </button>
              </div>
            </div>

            {/* Real-time Theme Rendering - Clean alignment without dead top space */}
            <div className="flex-1 overflow-y-auto flex items-start justify-center pt-1 pb-2">
              <SharedThemePreview theme={draft} mode={previewMode} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-border/60 flex items-center justify-between bg-muted/20">
          <Button type="button" onClick={handleAttemptClose} variant="outline" size="sm">
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!draft.name.trim() || saving}
              className="gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground border-0"
              size="sm"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Saving…' : mode === 'create' ? 'Create Theme' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Unsaved Changes Confirmation Dialog */}
        {showDiscardConfirm && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="bg-card max-w-sm w-full p-5 rounded-2xl border border-border shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">Discard unsaved changes?</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    You have modified this theme's configuration. Are you sure you want to exit without saving?
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiscardConfirm(false)}
                >
                  Continue Editing
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    onClose();
                  }}
                >
                  Discard Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ThemeEditorModal(props: ThemeEditorModalProps) {
  if (!props.isOpen) return null;
  return <ThemeEditorModalContent key={props.initialTheme?.id || 'new-theme'} {...props} />;
}
