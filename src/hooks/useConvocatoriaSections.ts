/**
 * useConvocatoriaSections Hook
 * Manages convocatoria section order, visibility, and content overrides
 * Persists to localStorage and syncs via site_config API
 */

import { useState, useEffect, useCallback } from 'react';
import { convocatoriaSections, ConvocatoriaSection } from '@/data/mockData';

// ============= Types =============

/** Section override stored in localStorage/site_config */
export interface ConvocatoriaSectionOverride {
  id: string;
  enabled: boolean;
  order: number;
  content?: string; // Admin-editable text override
}

// ============= Constants =============

const STORAGE_KEY = 'convocatoria_sections';

// ============= Hook =============

/**
 * Returns merged convocatoria sections (defaults + overrides)
 * sorted by order, with methods to update settings
 */
export const useConvocatoriaSections = () => {
  const [overrides, setOverrides] = useState<ConvocatoriaSectionOverride[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  /** Save overrides to localStorage */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  /** Merge defaults with overrides and sort by order */
  const sections: (ConvocatoriaSection & { content?: string })[] = convocatoriaSections
    .map((section) => {
      const override = overrides.find((o) => o.id === section.id);
      return {
        ...section,
        enabled: override?.enabled ?? section.enabled,
        order: override?.order ?? section.order,
        content: override?.content,
      };
    })
    .sort((a, b) => a.order - b.order);

  /** Update a section's enabled state */
  const setSectionEnabled = useCallback((sectionId: string, enabled: boolean) => {
    setOverrides((prev) => {
      const existing = prev.find((o) => o.id === sectionId);
      const defaultSection = convocatoriaSections.find((s) => s.id === sectionId);
      if (existing) {
        return prev.map((o) => (o.id === sectionId ? { ...o, enabled } : o));
      }
      return [...prev, { id: sectionId, enabled, order: defaultSection?.order ?? 99 }];
    });
  }, []);

  /** Update section order from reordered list */
  const reorderSections = useCallback((orderedIds: string[]) => {
    setOverrides((prev) => {
      const newOverrides = orderedIds.map((id, idx) => {
        const existing = prev.find((o) => o.id === id);
        return {
          id,
          enabled: existing?.enabled ?? convocatoriaSections.find((s) => s.id === id)?.enabled ?? true,
          order: idx + 1,
          content: existing?.content,
        };
      });
      return newOverrides;
    });
  }, []);

  /** Update section content override */
  const setSectionContent = useCallback((sectionId: string, content: string) => {
    setOverrides((prev) => {
      const existing = prev.find((o) => o.id === sectionId);
      const defaultSection = convocatoriaSections.find((s) => s.id === sectionId);
      if (existing) {
        return prev.map((o) => (o.id === sectionId ? { ...o, content: content || undefined } : o));
      }
      return [...prev, {
        id: sectionId,
        enabled: defaultSection?.enabled ?? true,
        order: defaultSection?.order ?? 99,
        content: content || undefined,
      }];
    });
  }, []);

  /** Get raw overrides for syncing to server */
  const getOverrides = useCallback(() => overrides, [overrides]);

  /** Load overrides from server data */
  const loadFromServer = useCallback((serverOverrides: ConvocatoriaSectionOverride[]) => {
    if (serverOverrides && serverOverrides.length > 0) {
      setOverrides(serverOverrides);
    }
  }, []);

  return {
    sections,
    setSectionEnabled,
    reorderSections,
    setSectionContent,
    getOverrides,
    loadFromServer,
  };
};
