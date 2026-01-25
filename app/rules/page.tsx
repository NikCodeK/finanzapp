'use client';

import { useEffect, useMemo, useState } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useFinancialRules } from '@/hooks/useFinancialRules';
import { classNames } from '@/lib/utils';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const briefingTemplate = `Kurzbriefing:
- Ziel der nächsten 3 Monate:
- Erwartete Einkommensänderungen:
- Prognose-Regeln (Fix/Variable/Kredite):
- Risiken & Trigger:
- Nächste Schritte:`;

function parseRules(text: string) {
  return text
    .split('\n')
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter((line) => line.length > 0);
}

export default function FinancialRulesPage() {
  const { rules, isLoading, isSaving, saveRules } = useFinancialRules();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [incomeRules, setIncomeRules] = useState('');
  const [forecastRules, setForecastRules] = useState('');
  const [briefing, setBriefing] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!hasInitialized && !isLoading) {
      setIncomeRules(rules?.incomeRules || '');
      setForecastRules(rules?.forecastRules || '');
      if (rules) {
        setBriefing(rules.briefing ?? '');
      } else {
        setBriefing(briefingTemplate);
      }
      setLastSavedAt(rules?.updatedAt || null);
      setHasInitialized(true);
    }
  }, [hasInitialized, isLoading, rules]);

  const incomeRuleList = useMemo(() => parseRules(incomeRules), [incomeRules]);
  const forecastRuleList = useMemo(() => parseRules(forecastRules), [forecastRules]);

  const handleSave = async () => {
    const saved = await saveRules({
      id: rules?.id,
      incomeRules,
      forecastRules,
      briefing,
    });
    if (saved?.updatedAt) {
      setLastSavedAt(saved.updatedAt);
    }
  };

  if (isLoading && !hasInitialized) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finanzregeln</h1>
          <p className="text-slate-500 mt-1">
            Übergeordnete Regeln für Einkommensentwicklung und Prognosen
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSavedAt && (
            <span className="text-xs text-slate-400">
              Zuletzt gespeichert: {new Date(lastSavedAt).toLocaleString('de-DE')}
            </span>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Einkommensregeln"
              subtitle="Eine Regel pro Zeile (z. B. Gehaltserhöhung ab Monat X)"
            />
            <textarea
              className="w-full min-h-[160px] rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="- Gehalt +5% ab Juli\n- Bonus nur Q2 und Q4\n- Nebenjob startet im Oktober"
              value={incomeRules}
              onChange={(event) => setIncomeRules(event.target.value)}
            />
          </Card>

          <Card>
            <CardHeader
              title="Prognose-Regeln"
              subtitle="Regeln für Fixkosten, variable Kosten und Schulden"
            />
            <textarea
              className="w-full min-h-[180px] rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="- Fixkosten +3% ab Mai\n- Variable Kosten bleiben konstant\n- Schuldenrate sinkt ab Oktober"
              value={forecastRules}
              onChange={(event) => setForecastRules(event.target.value)}
            />
          </Card>

          <Card>
            <CardHeader
              title="Finanzbriefing"
              subtitle="Dein kurzer Überblick für die nächsten Monate"
            />
            <textarea
              className="w-full min-h-[220px] rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={briefing}
              onChange={(event) => setBriefing(event.target.value)}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Aktive Regeln"
              subtitle="Aus deinen Eingaben zusammengefasst"
            />
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Einkommen</p>
                {incomeRuleList.length === 0 ? (
                  <p className="text-slate-400">Noch keine Regeln.</p>
                ) : (
                  <ul className="space-y-2">
                    {incomeRuleList.map((rule, index) => (
                      <li key={`income-${index}`} className="flex items-start gap-2 text-slate-700">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Prognose</p>
                {forecastRuleList.length === 0 ? (
                  <p className="text-slate-400">Noch keine Regeln.</p>
                ) : (
                  <ul className="space-y-2">
                    {forecastRuleList.map((rule, index) => (
                      <li key={`forecast-${index}`} className="flex items-start gap-2 text-slate-700">
                        <CheckCircleIcon className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Kurzvorlage"
              subtitle="Nutze diese Struktur für deinen Briefing-Text"
            />
            <div className="text-xs text-slate-600 space-y-2">
              <p className={classNames('rounded-lg border border-dashed border-slate-300 p-3 bg-slate-50')}>
                Ziel der nächsten 3 Monate<br />
                Erwartete Einkommensänderungen<br />
                Prognose-Regeln (Fix/Variable/Kredite)<br />
                Risiken & Trigger<br />
                Nächste Schritte
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
