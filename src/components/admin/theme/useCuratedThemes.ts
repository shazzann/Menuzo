import { useEffect, useState } from 'react';
import { ThemeService } from '@/services/theme.service';
import { CURATED_THEMES, curatedThemeFromRow, type CuratedTheme } from './curatedThemes';

let latest: CuratedTheme[] | null = null;
let inflight: Promise<CuratedTheme[]> | null = null;

// Several theme components mount together; share one request between them.
function loadThemes(): Promise<CuratedTheme[]> {
  inflight ??= ThemeService.listThemes()
    .then(rows => {
      latest = rows.length ? rows.map(curatedThemeFromRow) : CURATED_THEMES;
      return latest;
    })
    .finally(() => { inflight = null; });
  return inflight;
}

// The theme directory managed in the company Theme Library. Refreshes each time the
// theme page opens, and falls back to the built-in themes if it cannot be loaded.
export function useCuratedThemes(): CuratedTheme[] {
  const [themes, setThemes] = useState<CuratedTheme[]>(() => latest ?? CURATED_THEMES);
  useEffect(() => {
    let active = true;
    loadThemes()
      .then(result => { if (active) setThemes(result); })
      .catch(err => console.error('Could not load themes:', err));
    return () => { active = false; };
  }, []);
  return themes;
}
