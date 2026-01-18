'use client';

interface FinancialHealthScoreProps {
  score: number;
}

export default function FinancialHealthScore({ score }: FinancialHealthScoreProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-600';
    if (s >= 60) return 'text-green-600';
    if (s >= 40) return 'text-yellow-600';
    if (s >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Ausgezeichnet';
    if (s >= 60) return 'Gut';
    if (s >= 40) return 'Befriedigend';
    if (s >= 20) return 'Verbesserungswürdig';
    return 'Kritisch';
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'from-emerald-500 to-emerald-600';
    if (s >= 60) return 'from-green-500 to-green-600';
    if (s >= 40) return 'from-yellow-500 to-yellow-600';
    if (s >= 20) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-slate-200"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease-in-out',
            }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`stop-color-${getScoreBg(score).split(' ')[0].replace('from-', '')}`} style={{ stopColor: score >= 60 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444' }} />
              <stop offset="100%" className={`stop-color-${getScoreBg(score).split(' ')[1].replace('to-', '')}`} style={{ stopColor: score >= 60 ? '#16a34a' : score >= 40 ? '#ca8a04' : '#dc2626' }} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {Math.round(score)}
          </span>
          <span className="text-xs text-slate-500">von 100</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className={`font-semibold ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </p>
        <p className="text-xs text-slate-500 mt-1">Financial Health Score</p>
      </div>
    </div>
  );
}
