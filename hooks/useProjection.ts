'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProjectionSettings, ProjectionMonth } from '@/lib/types';
import {
  getProjectionSettings,
  saveProjectionSettings,
  initializeStorage,
} from '@/lib/storage';
import { generateProjection } from '@/lib/calculations';

export function useProjection() {
  const [settings, setSettings] = useState<ProjectionSettings | null>(null);
  const [scenario, setScenario] = useState<'base' | 'best' | 'worst'>('base');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const data = getProjectionSettings();
    setSettings(data);
    setIsLoading(false);
  }, []);

  const updateSettings = useCallback((updated: ProjectionSettings) => {
    setSettings(updated);
    saveProjectionSettings(updated);
  }, []);

  const updateField = useCallback(
    <K extends keyof ProjectionSettings>(
      field: K,
      value: ProjectionSettings[K]
    ) => {
      if (!settings) return;
      const updated = { ...settings, [field]: value };
      setSettings(updated);
      saveProjectionSettings(updated);
    },
    [settings]
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
  };
}
