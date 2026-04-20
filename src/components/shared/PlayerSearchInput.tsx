/**
 * PlayerSearchInput
 * Reusable search input with autocomplete dropdown for player names.
 * - Sanitizes input (handles double spaces, accents, casing)
 * - Shows up to N suggestions from the provided unique-name list
 * - Click suggestion to fill input + commit query
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { filterSuggestions } from '@/lib/searchUtils';

interface PlayerSearchInputProps {
  /** Current search query value (controlled) */
  value: string;
  /** Called whenever the input changes or a suggestion is picked */
  onChange: (value: string) => void;
  /**
   * Called only on explicit submission: pressing Enter or clicking a
   * suggestion. Use this for navigation/side-effects so they don't fire
   * on every keystroke.
   */
  onSubmit?: (value: string) => void;
  /** Full list of unique player names available for autocomplete */
  suggestions: string[];
  /** Placeholder text */
  placeholder?: string;
  /** Wrapper class for sizing/positioning */
  className?: string;
  /** Max suggestions to display */
  maxSuggestions?: number;
}

const PlayerSearchInput = ({
  value,
  onChange,
  onSubmit,
  suggestions,
  placeholder = 'Buscar jugador por nombre...',
  className = '',
  maxSuggestions = 8,
}: PlayerSearchInputProps) => {
  /** Whether the suggestion dropdown is open */
  const [open, setOpen] = useState(false);
  /** Container ref for outside-click detection */
  const containerRef = useRef<HTMLDivElement>(null);

  /** Filtered suggestion list based on current query */
  const filtered = useMemo(
    () => filterSuggestions(suggestions, value, maxSuggestions),
    [suggestions, value, maxSuggestions]
  );

  /** Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /** Handle suggestion pick: fill the input and close dropdown */
  const handlePick = (name: string) => {
    onChange(name);
    setOpen(false);
    /** Notify parent of explicit selection (e.g. for navigation) */
    onSubmit?.(name);
  };

  /** Handle clear button */
  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          /** Submit on Enter when there is content (no suggestion required) */
          if (e.key === 'Enter') {
            e.preventDefault();
            setOpen(false);
            onSubmit?.(value);
          }
        }}
        className="pl-10 pr-10"
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Suggestions dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handlePick(name)}
              className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerSearchInput;
