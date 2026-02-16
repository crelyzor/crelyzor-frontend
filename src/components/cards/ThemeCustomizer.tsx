import { Label } from '@/components/ui/label';
import type { CardTheme } from '@/types';

const PRESETS: { name: string; theme: CardTheme }[] = [
  { name: 'Default', theme: {} },
  {
    name: 'Professional',
    theme: { primaryColor: '#1e3a5f', backgroundColor: '#f8fafc', fontFamily: 'Inter', layout: 'classic' },
  },
  {
    name: 'Creative',
    theme: { primaryColor: '#7c3aed', backgroundColor: '#faf5ff', fontFamily: 'Playfair Display', layout: 'modern' },
  },
  {
    name: 'Minimal',
    theme: { primaryColor: '#171717', backgroundColor: '#ffffff', fontFamily: 'Inter', layout: 'minimal' },
  },
  {
    name: 'Bold',
    theme: { primaryColor: '#dc2626', backgroundColor: '#0a0a0a', fontFamily: 'Montserrat', layout: 'classic', darkMode: true },
  },
];

const FONTS = [
  { value: '', label: 'System Default' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Montserrat', label: 'Montserrat' },
];

const LAYOUTS: { value: CardTheme['layout']; label: string; desc: string }[] = [
  { value: 'classic', label: 'Classic', desc: 'Cover image with side avatar' },
  { value: 'modern', label: 'Modern', desc: 'Centered layout' },
  { value: 'minimal', label: 'Minimal', desc: 'No cover, clean look' },
];

interface ThemeCustomizerProps {
  theme: CardTheme;
  onChange: (theme: CardTheme) => void;
}

export function ThemeCustomizer({ theme, onChange }: ThemeCustomizerProps) {
  return (
    <div className="space-y-5">
      {/* Presets */}
      <div className="space-y-2">
        <Label className="text-neutral-700 dark:text-neutral-300 text-xs">
          Presets
        </Label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange({ ...preset.theme })}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800
                         text-xs font-medium text-neutral-700 dark:text-neutral-300
                         hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div className="space-y-2">
        <Label className="text-neutral-700 dark:text-neutral-300 text-xs">
          Layout
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => onChange({ ...theme, layout: layout.value })}
              className={`p-3 rounded-xl border text-left transition-all ${
                (theme.layout || 'classic') === layout.value
                  ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                {layout.label}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                {layout.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-neutral-700 dark:text-neutral-300 text-xs">
            Primary Color
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.primaryColor || '#171717'}
              onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })}
              className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={theme.primaryColor || '#171717'}
              onChange={(e) => onChange({ ...theme, primaryColor: e.target.value })}
              className="flex-1 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900
                         text-xs text-neutral-700 dark:text-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="#171717"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-neutral-700 dark:text-neutral-300 text-xs">
            Background
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.backgroundColor || '#ffffff'}
              onChange={(e) => onChange({ ...theme, backgroundColor: e.target.value })}
              className="w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={theme.backgroundColor || '#ffffff'}
              onChange={(e) => onChange({ ...theme, backgroundColor: e.target.value })}
              className="flex-1 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900
                         text-xs text-neutral-700 dark:text-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* Font */}
      <div className="space-y-2">
        <Label className="text-neutral-700 dark:text-neutral-300 text-xs">
          Font Family
        </Label>
        <select
          value={theme.fontFamily || ''}
          onChange={(e) => onChange({ ...theme, fontFamily: e.target.value || undefined })}
          className="w-full h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900
                     text-sm text-neutral-700 dark:text-neutral-300 px-3 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dark mode */}
      <label className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
        <input
          type="checkbox"
          checked={theme.darkMode ?? false}
          onChange={(e) => onChange({ ...theme, darkMode: e.target.checked })}
          className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 focus:ring-neutral-900/20"
        />
        <div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Dark mode
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Use a dark background for the public card
          </p>
        </div>
      </label>
    </div>
  );
}
