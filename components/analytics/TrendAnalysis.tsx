'use client';

import { CategoryTrend } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendAnalysisProps {
  categoryTrends: CategoryTrend[];
  growingCategories: CategoryTrend[];
}

export default function TrendAnalysis({ categoryTrends, growingCategories }: TrendAnalysisProps) {
  // Prepare data for the chart - top 5 categories
  const topCategories = categoryTrends.slice(0, 5);

  const chartData = topCategories[0]?.months.map((_, index) => {
    const dataPoint: Record<string, string | number> = {
      month: topCategories[0].months[index].monthISO.substring(5), // MM format
    };
    topCategories.forEach(cat => {
      dataPoint[cat.category] = cat.months[index].amount;
    });
    return dataPoint;
  }) || [];

  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Growing Categories Alert */}
      {growingCategories.length > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="font-medium text-orange-900 flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5" />
            Wachsende Ausgaben
          </h4>
          <div className="mt-2 space-y-2">
            {growingCategories.slice(0, 3).map((cat) => (
              <div key={cat.category} className="flex justify-between items-center">
                <span className="text-sm text-orange-800">{cat.category}</span>
                <span className="text-sm font-medium text-orange-600">
                  +{cat.trend.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {chartData.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              {topCategories.map((cat, index) => (
                <Line
                  key={cat.category}
                  type="monotone"
                  dataKey={cat.category}
                  stroke={colors[index]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {topCategories.map((cat, index) => (
          <div key={cat.category} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index] }}
            />
            <span className="text-sm text-slate-600">{cat.category}</span>
          </div>
        ))}
      </div>

      {/* Category Details */}
      <div className="space-y-3">
        {categoryTrends.slice(0, 8).map((category) => (
          <div
            key={category.category}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {category.trend > 5 ? (
                <ArrowTrendingUpIcon className="h-5 w-5 text-red-500" />
              ) : category.trend < -5 ? (
                <ArrowTrendingDownIcon className="h-5 w-5 text-green-500" />
              ) : (
                <MinusIcon className="h-5 w-5 text-slate-400" />
              )}
              <span className="font-medium text-slate-900">{category.category}</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">
                {formatCurrency(category.averageMonthly)}/M
              </p>
              <p
                className={`text-xs ${
                  category.trend > 5
                    ? 'text-red-600'
                    : category.trend < -5
                    ? 'text-green-600'
                    : 'text-slate-500'
                }`}
              >
                {category.trend > 0 ? '+' : ''}
                {category.trend.toFixed(0)}% Trend
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
