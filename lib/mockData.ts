import { Transaction, WeeklyReport, Budget, ProjectionSettings } from './types';
import { subDays, subWeeks, format, startOfWeek, endOfWeek } from 'date-fns';

const today = new Date();

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate transactions for the last 3 months
export const mockTransactions: Transaction[] = [
  // Recurring income - Gehalt
  { id: generateId(), dateISO: format(subDays(today, 5), 'yyyy-MM-dd'), amount: 3500, type: 'income', category: 'Gehalt', account: 'Girokonto', recurring: true, note: 'Monatsgehalt Januar' },
  { id: generateId(), dateISO: format(subDays(today, 35), 'yyyy-MM-dd'), amount: 3500, type: 'income', category: 'Gehalt', account: 'Girokonto', recurring: true, note: 'Monatsgehalt Dezember' },
  { id: generateId(), dateISO: format(subDays(today, 65), 'yyyy-MM-dd'), amount: 3500, type: 'income', category: 'Gehalt', account: 'Girokonto', recurring: true, note: 'Monatsgehalt November' },

  // Freelance income
  { id: generateId(), dateISO: format(subDays(today, 10), 'yyyy-MM-dd'), amount: 800, type: 'income', category: 'Freelance', account: 'Girokonto', recurring: false, note: 'Webdesign Projekt' },
  { id: generateId(), dateISO: format(subDays(today, 45), 'yyyy-MM-dd'), amount: 600, type: 'income', category: 'Freelance', account: 'Girokonto', recurring: false, note: 'Logo Design' },

  // Miete (recurring)
  { id: generateId(), dateISO: format(subDays(today, 3), 'yyyy-MM-dd'), amount: 950, type: 'expense', category: 'Miete', account: 'Girokonto', recurring: true, note: 'Warmmiete Januar' },
  { id: generateId(), dateISO: format(subDays(today, 33), 'yyyy-MM-dd'), amount: 950, type: 'expense', category: 'Miete', account: 'Girokonto', recurring: true, note: 'Warmmiete Dezember' },
  { id: generateId(), dateISO: format(subDays(today, 63), 'yyyy-MM-dd'), amount: 950, type: 'expense', category: 'Miete', account: 'Girokonto', recurring: true, note: 'Warmmiete November' },

  // Lebensmittel
  { id: generateId(), dateISO: format(subDays(today, 1), 'yyyy-MM-dd'), amount: 85.50, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Wocheneinkauf REWE' },
  { id: generateId(), dateISO: format(subDays(today, 4), 'yyyy-MM-dd'), amount: 32.80, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Obst und Gemüse' },
  { id: generateId(), dateISO: format(subDays(today, 8), 'yyyy-MM-dd'), amount: 95.20, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Wocheneinkauf EDEKA' },
  { id: generateId(), dateISO: format(subDays(today, 15), 'yyyy-MM-dd'), amount: 78.40, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Wocheneinkauf' },
  { id: generateId(), dateISO: format(subDays(today, 22), 'yyyy-MM-dd'), amount: 110.30, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Großeinkauf' },
  { id: generateId(), dateISO: format(subDays(today, 29), 'yyyy-MM-dd'), amount: 65.90, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Wocheneinkauf' },
  { id: generateId(), dateISO: format(subDays(today, 36), 'yyyy-MM-dd'), amount: 88.70, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Wocheneinkauf' },
  { id: generateId(), dateISO: format(subDays(today, 43), 'yyyy-MM-dd'), amount: 92.15, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Wocheneinkauf' },
  { id: generateId(), dateISO: format(subDays(today, 50), 'yyyy-MM-dd'), amount: 71.80, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Wocheneinkauf' },
  { id: generateId(), dateISO: format(subDays(today, 57), 'yyyy-MM-dd'), amount: 105.40, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Wocheneinkauf' },
  { id: generateId(), dateISO: format(subDays(today, 64), 'yyyy-MM-dd'), amount: 83.20, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Wocheneinkauf' },
  { id: generateId(), dateISO: format(subDays(today, 71), 'yyyy-MM-dd'), amount: 79.60, type: 'expense', category: 'Lebensmittel', account: 'Kreditkarte', recurring: false, note: 'Wocheneinkauf' },

  // Transport
  { id: generateId(), dateISO: format(subDays(today, 2), 'yyyy-MM-dd'), amount: 89, type: 'expense', category: 'Transport', account: 'Girokonto', recurring: true, note: 'Deutschlandticket' },
  { id: generateId(), dateISO: format(subDays(today, 32), 'yyyy-MM-dd'), amount: 89, type: 'expense', category: 'Transport', account: 'Girokonto', recurring: true, note: 'Deutschlandticket' },
  { id: generateId(), dateISO: format(subDays(today, 62), 'yyyy-MM-dd'), amount: 89, type: 'expense', category: 'Transport', account: 'Girokonto', recurring: true, note: 'Deutschlandticket' },
  { id: generateId(), dateISO: format(subDays(today, 20), 'yyyy-MM-dd'), amount: 45.50, type: 'expense', category: 'Transport', account: 'Kreditkarte', recurring: false, note: 'Tankfüllung' },
  { id: generateId(), dateISO: format(subDays(today, 55), 'yyyy-MM-dd'), amount: 52.30, type: 'expense', category: 'Transport', account: 'Kreditkarte', recurring: false, note: 'Tankfüllung' },

  // Unterhaltung
  { id: generateId(), dateISO: format(subDays(today, 6), 'yyyy-MM-dd'), amount: 12.99, type: 'expense', category: 'Unterhaltung', account: 'Kreditkarte', recurring: true, note: 'Netflix' },
  { id: generateId(), dateISO: format(subDays(today, 36), 'yyyy-MM-dd'), amount: 12.99, type: 'expense', category: 'Unterhaltung', account: 'Kreditkarte', recurring: true, note: 'Netflix' },
  { id: generateId(), dateISO: format(subDays(today, 66), 'yyyy-MM-dd'), amount: 12.99, type: 'expense', category: 'Unterhaltung', account: 'Kreditkarte', recurring: true, note: 'Netflix' },
  { id: generateId(), dateISO: format(subDays(today, 7), 'yyyy-MM-dd'), amount: 10.99, type: 'expense', category: 'Unterhaltung', account: 'Kreditkarte', recurring: true, note: 'Spotify' },
  { id: generateId(), dateISO: format(subDays(today, 37), 'yyyy-MM-dd'), amount: 10.99, type: 'expense', category: 'Unterhaltung', account: 'Kreditkarte', recurring: true, note: 'Spotify' },
  { id: generateId(), dateISO: format(subDays(today, 67), 'yyyy-MM-dd'), amount: 10.99, type: 'expense', category: 'Unterhaltung', account: 'Kreditkarte', recurring: true, note: 'Spotify' },
  { id: generateId(), dateISO: format(subDays(today, 12), 'yyyy-MM-dd'), amount: 35, type: 'expense', category: 'Unterhaltung', account: 'Bargeld', recurring: false, note: 'Kino mit Freunden' },
  { id: generateId(), dateISO: format(subDays(today, 25), 'yyyy-MM-dd'), amount: 65, type: 'expense', category: 'Unterhaltung', account: 'Kreditkarte', recurring: false, note: 'Restaurant' },
  { id: generateId(), dateISO: format(subDays(today, 48), 'yyyy-MM-dd'), amount: 42, type: 'expense', category: 'Unterhaltung', account: 'Kreditkarte', recurring: false, note: 'Bar' },

  // Versicherung
  { id: generateId(), dateISO: format(subDays(today, 15), 'yyyy-MM-dd'), amount: 180, type: 'expense', category: 'Versicherung', account: 'Girokonto', recurring: true, note: 'Krankenversicherung' },
  { id: generateId(), dateISO: format(subDays(today, 45), 'yyyy-MM-dd'), amount: 180, type: 'expense', category: 'Versicherung', account: 'Girokonto', recurring: true, note: 'Krankenversicherung' },
  { id: generateId(), dateISO: format(subDays(today, 75), 'yyyy-MM-dd'), amount: 180, type: 'expense', category: 'Versicherung', account: 'Girokonto', recurring: true, note: 'Krankenversicherung' },

  // Gesundheit
  { id: generateId(), dateISO: format(subDays(today, 18), 'yyyy-MM-dd'), amount: 25, type: 'expense', category: 'Gesundheit', account: 'Bargeld', recurring: false, note: 'Apotheke' },
  { id: generateId(), dateISO: format(subDays(today, 40), 'yyyy-MM-dd'), amount: 85, type: 'expense', category: 'Gesundheit', account: 'Girokonto', recurring: false, note: 'Zahnarzt Zuzahlung' },

  // Kleidung
  { id: generateId(), dateISO: format(subDays(today, 14), 'yyyy-MM-dd'), amount: 89.90, type: 'expense', category: 'Kleidung', account: 'Kreditkarte', recurring: false, note: 'Winterjacke Sale' },
  { id: generateId(), dateISO: format(subDays(today, 52), 'yyyy-MM-dd'), amount: 45, type: 'expense', category: 'Kleidung', account: 'Kreditkarte', recurring: false, note: 'T-Shirts' },

  // Haushalt
  { id: generateId(), dateISO: format(subDays(today, 9), 'yyyy-MM-dd'), amount: 35.80, type: 'expense', category: 'Haushalt', account: 'Kreditkarte', recurring: false, note: 'Putzmittel DM' },
  { id: generateId(), dateISO: format(subDays(today, 38), 'yyyy-MM-dd'), amount: 120, type: 'expense', category: 'Haushalt', account: 'Kreditkarte', recurring: false, note: 'Neue Lampe' },

  // Investment returns
  { id: generateId(), dateISO: format(subDays(today, 28), 'yyyy-MM-dd'), amount: 125, type: 'income', category: 'Investments', account: 'Sparkonto', recurring: false, note: 'Dividende ETF' },

  // Sparkonto transfers
  { id: generateId(), dateISO: format(subDays(today, 5), 'yyyy-MM-dd'), amount: 500, type: 'expense', category: 'Sonstiges', account: 'Girokonto', recurring: true, note: 'Sparrate' },
  { id: generateId(), dateISO: format(subDays(today, 35), 'yyyy-MM-dd'), amount: 500, type: 'expense', category: 'Sonstiges', account: 'Girokonto', recurring: true, note: 'Sparrate' },
  { id: generateId(), dateISO: format(subDays(today, 65), 'yyyy-MM-dd'), amount: 500, type: 'expense', category: 'Sonstiges', account: 'Girokonto', recurring: true, note: 'Sparrate' },
];

// Generate weekly reports for the last 6 weeks
function generateWeeklyReports(): WeeklyReport[] {
  const reports: WeeklyReport[] = [];
  const moods: (1 | 2 | 3 | 4 | 5)[] = [4, 3, 4, 5, 3, 4];
  const insights = [
    'Lebensmittelausgaben waren diese Woche höher als geplant.',
    'Gute Woche - unter dem Budget geblieben.',
    'Unerwartete Ausgabe für Gesundheit.',
    'Freelance-Projekt abgeschlossen, guter Zusatzverdienst.',
    'Zu viel für Unterhaltung ausgegeben.',
    'Stabile Woche, alle Ausgaben im Rahmen.',
  ];
  const decisions = [
    'Nächste Woche Meal Prep ausprobieren.',
    'Weiter so, Budget einhalten.',
    'Notfallfonds erhöhen.',
    'Mehr Freelance-Projekte annehmen.',
    'Nächsten Monat weniger ausgehen.',
    'Sparrate beibehalten.',
  ];
  const top3s = [
    'Miete, Lebensmittel, Transport',
    'Miete, Versicherung, Lebensmittel',
    'Miete, Gesundheit, Lebensmittel',
    'Miete, Lebensmittel, Kleidung',
    'Miete, Unterhaltung, Lebensmittel',
    'Miete, Lebensmittel, Haushalt',
  ];

  for (let i = 0; i < 6; i++) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });

    const income = i === 0 || i === 4 ? 3500 + (i === 0 ? 800 : 0) : (i === 3 ? 600 : 0);
    const expenses = 1200 + Math.random() * 400;

    reports.push({
      id: generateId(),
      weekStartISO: format(weekStart, 'yyyy-MM-dd'),
      weekEndISO: format(weekEnd, 'yyyy-MM-dd'),
      income: Math.round(income),
      expenses: Math.round(expenses),
      net: Math.round(income - expenses),
      top3: top3s[i],
      insights: insights[i],
      nextDecision: decisions[i],
      mood: moods[i],
    });
  }

  return reports;
}

export const mockWeeklyReports: WeeklyReport[] = generateWeeklyReports();

// Current month budgets
export const mockBudgets: Budget[] = [
  { id: generateId(), monthISO: format(today, 'yyyy-MM'), category: 'Miete', budgetAmount: 950 },
  { id: generateId(), monthISO: format(today, 'yyyy-MM'), category: 'Lebensmittel', budgetAmount: 400 },
  { id: generateId(), monthISO: format(today, 'yyyy-MM'), category: 'Transport', budgetAmount: 150 },
  { id: generateId(), monthISO: format(today, 'yyyy-MM'), category: 'Unterhaltung', budgetAmount: 150 },
  { id: generateId(), monthISO: format(today, 'yyyy-MM'), category: 'Versicherung', budgetAmount: 200 },
  { id: generateId(), monthISO: format(today, 'yyyy-MM'), category: 'Gesundheit', budgetAmount: 100 },
  { id: generateId(), monthISO: format(today, 'yyyy-MM'), category: 'Kleidung', budgetAmount: 100 },
  { id: generateId(), monthISO: format(today, 'yyyy-MM'), category: 'Haushalt', budgetAmount: 100 },
  { id: generateId(), monthISO: format(today, 'yyyy-MM'), category: 'Sonstiges', budgetAmount: 600 },
];

export const defaultProjectionSettings: ProjectionSettings = {
  expectedIncome: 4000,
  fixedCosts: 1500,
  variableCosts: 1000,
  growthRate: 3,
  startingCash: 5000,
  startingDebt: 0,
  scenarioMultipliers: {
    best: 1.15,
    worst: 0.85,
  },
};
