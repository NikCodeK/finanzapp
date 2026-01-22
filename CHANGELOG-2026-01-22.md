# Finanzapp Erweiterung - Changelog 22.01.2026

## Übersicht

Diese Aktualisierung fügt umfangreiche neue Features zur Finanzapp hinzu:
- Subscription-Tracker (Abo-Verwaltung)
- Investment-Tracking (Portfolio-Übersicht)
- Planungs-Features (Anschaffungen, Events, Szenarien)
- Ausgaben-Analyse mit Insights

---

## Neue Dateien

### Datenbank-Migration
| Datei | Beschreibung |
|-------|--------------|
| `scripts/migration-new-features.sql` | SQL-Schema für 7 neue Tabellen |

### Custom Hooks
| Datei | Beschreibung |
|-------|--------------|
| `hooks/useSubscriptions.ts` | Abo-Verwaltung mit Kündigungserinnerungen |
| `hooks/usePlanning.ts` | Anschaffungen, Events, Szenarien |
| `hooks/useInvestments.ts` | Portfolio-Tracking und Sparpläne |
| `hooks/useAnalytics.ts` | Ausgaben-Muster und Trend-Analyse |

### Subscriptions Feature
| Datei | Beschreibung |
|-------|--------------|
| `app/subscriptions/page.tsx` | Hauptseite für Abo-Verwaltung |
| `components/subscriptions/SubscriptionForm.tsx` | Formular zum Erstellen/Bearbeiten |
| `components/subscriptions/SubscriptionList.tsx` | Listenansicht aller Abos |

### Planning Feature
| Datei | Beschreibung |
|-------|--------------|
| `app/planning/page.tsx` | Hauptseite mit 3 Tabs |
| `components/planning/PlannedPurchaseForm.tsx` | Formular für Anschaffungen |
| `components/planning/EventBudgetForm.tsx` | Formular für Event-Budgets |
| `components/planning/ScenarioSimulator.tsx` | Was-wäre-wenn Simulator |

### Analytics Feature
| Datei | Beschreibung |
|-------|--------------|
| `app/analytics/page.tsx` | Ausgaben-Analyse Dashboard |
| `components/analytics/SpendingPatterns.tsx` | Ausgaben nach Wochentag |
| `components/analytics/TrendAnalysis.tsx` | Kategorie-Trends über Zeit |

### Investments Feature
| Datei | Beschreibung |
|-------|--------------|
| `app/investments/page.tsx` | Portfolio-Übersicht |
| `components/investments/InvestmentForm.tsx` | Investment erstellen/bearbeiten |
| `components/investments/SavingsPlanForm.tsx` | Sparplan erstellen/bearbeiten |
| `components/investments/PortfolioOverview.tsx` | Portfolio-Zusammenfassung mit Charts |

---

## Geänderte Dateien

### `lib/types.ts`
**Neue Typen hinzugefügt:**

```typescript
// Subscriptions
- SubscriptionFrequency
- Subscription
- SUBSCRIPTION_CATEGORIES

// Planned Purchases
- PurchaseStatus
- PlannedPurchase
- PURCHASE_CATEGORIES

// Life Scenarios
- ScenarioType
- ExpenseChange
- LifeScenario
- SCENARIO_TYPES

// Event Budgets
- EventBudgetStatus
- EventBudget
- EVENT_CATEGORIES

// Investments
- InvestmentType
- Investment
- INVESTMENT_TYPES
- InvestmentTransactionType
- InvestmentTransaction
- INVESTMENT_TRANSACTION_TYPES
- SavingsPlanFrequency
- SavingsPlan

// Analytics
- SpendingPattern
- CategoryTrend
- LifestyleInflationAlert
- MissedSavingsOpportunity
```

### `lib/supabase-storage.ts`
**Neue Imports:**
```typescript
import {
  Subscription,
  PlannedPurchase,
  LifeScenario,
  EventBudget,
  Investment,
  InvestmentTransaction,
  SavingsPlan,
} from './types';
```

**Neue Funktionen:**
```typescript
// Subscriptions
- getSubscriptions()
- addSubscription()
- updateSubscription()
- deleteSubscription()

// Planned Purchases
- getPlannedPurchases()
- addPlannedPurchase()
- updatePlannedPurchase()
- deletePlannedPurchase()

// Life Scenarios
- getLifeScenarios()
- addLifeScenario()
- updateLifeScenario()
- deleteLifeScenario()

// Event Budgets
- getEventBudgets()
- addEventBudget()
- updateEventBudget()
- deleteEventBudget()

// Investments
- getInvestments()
- addInvestment()
- updateInvestment()
- deleteInvestment()

// Investment Transactions
- getInvestmentTransactions()
- addInvestmentTransaction()
- deleteInvestmentTransaction()

// Savings Plans
- getSavingsPlans()
- addSavingsPlan()
- updateSavingsPlan()
- deleteSavingsPlan()
```

### `components/Sidebar.tsx`
**Neue Imports:**
```typescript
import {
  CreditCardIcon,
  ShoppingCartIcon,
  ChartPieIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';
```

**Neue Navigation-Einträge:**
```typescript
{ name: 'Abos', href: '/subscriptions', icon: CreditCardIcon },
{ name: 'Investments', href: '/investments', icon: CurrencyEuroIcon },
{ name: 'Planung', href: '/planning', icon: ShoppingCartIcon },
{ name: 'Analyse', href: '/analytics', icon: ChartPieIcon },
```

### `app/page.tsx` (Dashboard)
**Neue Imports:**
```typescript
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useInvestments } from '@/hooks/useInvestments';
import { usePlanning } from '@/hooks/usePlanning';
import {
  CreditCardIcon,
  BellAlertIcon,
  CurrencyEuroIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
```

**Neue Widgets:**
1. **Abo-Widget** - Zeigt monatliche Kosten und Kündigungswarnungen
2. **Investment-Widget** - Portfolio-Wert und Performance
3. **Planungs-Widget** - Aktive Anschaffungen und Event-Budgets

**Erweiterte Schnellaktionen:**
- Abos
- Investments
- Planung
- Analyse

---

## Datenbank-Schema

### Neue Tabellen

#### `subscriptions`
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK -> auth.users)
- name TEXT
- provider TEXT
- amount DECIMAL(12, 2)
- frequency TEXT ('monatlich', 'vierteljaehrlich', 'halbjaehrlich', 'jaehrlich')
- category TEXT
- start_date_iso TEXT
- cancellation_period_days INTEGER
- next_billing_date_iso TEXT
- auto_renew BOOLEAN
- is_active BOOLEAN
- note TEXT
```

#### `planned_purchases`
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK -> auth.users)
- name TEXT
- target_amount DECIMAL(12, 2)
- current_amount DECIMAL(12, 2)
- monthly_contribution DECIMAL(12, 2)
- priority INTEGER (1, 2, 3)
- target_date_iso TEXT
- category TEXT
- status TEXT ('aktiv', 'pausiert', 'erreicht')
- note TEXT
```

#### `life_scenarios`
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK -> auth.users)
- name TEXT
- type TEXT ('gehaltsaenderung', 'umzug', 'jobwechsel', 'familienzuwachs', 'ruhestand', 'sonstiges')
- income_change DECIMAL(12, 2)
- expense_changes JSONB
- one_time_costs DECIMAL(12, 2)
- start_date_iso TEXT
- duration_months INTEGER
- note TEXT
```

#### `event_budgets`
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK -> auth.users)
- name TEXT
- target_amount DECIMAL(12, 2)
- current_amount DECIMAL(12, 2)
- event_date_iso TEXT
- category TEXT
- status TEXT ('aktiv', 'abgeschlossen')
- note TEXT
```

#### `investments`
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK -> auth.users)
- name TEXT
- type TEXT ('aktie', 'etf', 'krypto', 'fond', 'anleihe', 'sonstiges')
- symbol TEXT
- isin TEXT
- quantity DECIMAL(16, 8)
- purchase_price DECIMAL(12, 4)
- current_price DECIMAL(12, 4)
- purchase_date_iso TEXT
- broker TEXT
- is_active BOOLEAN
- note TEXT
```

#### `investment_transactions`
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK -> auth.users)
- investment_id UUID (FK -> investments)
- type TEXT ('kauf', 'verkauf', 'dividende', 'split', 'gebuehr')
- quantity DECIMAL(16, 8)
- price DECIMAL(12, 4)
- total_amount DECIMAL(12, 2)
- fees DECIMAL(12, 2)
- date_iso TEXT
- note TEXT
```

#### `savings_plans`
```sql
- id UUID PRIMARY KEY
- user_id UUID (FK -> auth.users)
- investment_id UUID (FK -> investments)
- name TEXT
- amount DECIMAL(12, 2)
- frequency TEXT ('monatlich', 'vierteljaehrlich', 'halbjaehrlich', 'jaehrlich')
- execution_day INTEGER (1-28)
- start_date_iso TEXT
- end_date_iso TEXT
- is_active BOOLEAN
- note TEXT
```

---

## Deployment-Schritte

### 1. Datenbank-Migration ausführen
```bash
# In Supabase SQL Editor ausführen:
# Inhalt von scripts/migration-new-features.sql
```

### 2. Build prüfen
```bash
npm run build
```

### 3. Entwicklungsserver starten
```bash
npm run dev
```

### 4. Features testen
- [ ] Abo erstellen, bearbeiten, löschen
- [ ] Kündigungserinnerung prüfen
- [ ] Anschaffung planen und Fortschritt tracken
- [ ] Szenario erstellen und Auswirkungen sehen
- [ ] Investment hinzufügen und Performance tracken
- [ ] Analytics-Seite mit echten Daten prüfen
- [ ] Dashboard-Widgets funktionieren

---

## Feature-Details

### Subscription-Tracker
- Automatische Berechnung der monatlichen Kosten (auch bei jährlichen Abos)
- Kündigungserinnerungen basierend auf Kündigungsfrist
- Gruppierung nach Kategorien
- Filter für aktive/inaktive Abos

### Investment-Tracking
- Portfolio-Übersicht mit Gesamtwert und Performance
- Aufteilung nach Investment-Typ (Pie-Chart)
- Gewinn/Verlust pro Position
- Sparplan-Verwaltung mit monatlicher Übersicht

### Planungs-Features
- **Anschaffungen**: Sparziel mit monatlicher Rate und Fortschrittsanzeige
- **Event-Budgets**: Budget für einmalige Events (Urlaub, Weihnachten)
- **Szenarien**: Was-wäre-wenn Simulationen für Lebensveränderungen

### Ausgaben-Analyse
- Ausgaben-Muster nach Wochentag
- Trend-Analyse für alle Kategorien
- Lifestyle-Inflation-Warnungen
- Verpasste Spar-Potenziale (Budget-Überschreitungen)

---

## Technische Details

- **Framework**: Next.js 14.2.5 (App Router)
- **Datenbank**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Icons**: Heroicons

Alle neuen Seiten sind als statische Seiten optimiert und folgen dem bestehenden Code-Pattern der App.
