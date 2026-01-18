'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProjectionSettings, ProjectionMonth } from '@/lib/types';
import {
  getProjectionSettings,
  saveProjectionSettings as saveProjectionSettingsDB,
} from '@/lib/supabase-storage';
import { generateProjection } from '@/lib/calculations';

export function useProjection() {
  const [settings, setSettings] = useState<ProjectionSettings | null>(null);
  const [scenario, setScenario] = useState<'base' | 'best' | 'worst'>('base');
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    const data = await getProjectionSettings();
    setSettings(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (updated: ProjectionSettings) => {
    const success = await saveProjectionSettingsDB(updated);
    if (success) {
      setSettings(updated);
    }
    return success;
  }, []);

  const updateField = useCallback(
    async <K extends keyof ProjectionSettings>(
      field: K,
      value: ProjectionSettings[K]
    ) => {
      if (!settings) return false;
      const updated = { ...settings, [field]: value };
      return updateSettings(updated);
    },
    [settings, updateSettings]
  );

  const projection: ProjectionMonth[] = useMemo(() => {
    if (!settings) return [];
    return generateProjection(settings, scenario);
  }, [settings, scenario]);

  const allScenarios = useMemo(() => {
    if (!settings) return { base: [], best: [], worst: [] };
    return {
      base: generateProjection(settings, 'base'),
      best: generateProjection(settings, 'best'),
      worst: generateProjection(settings, 'worst'),
    };
  }, [settings]);

  return {
    settings,
    scenario,
    setScenario,
    updateSettings,
    updateField,
    projection,
    allScenarios,
    isLoading,
    refresh: loadSettings,
  };
}
