'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface ExpenseSliderProps {
  label: string;
  value: number;
  currentValue: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: 'red' | 'orange' | 'slate';
}

export default function ExpenseSlider({
  label,
  value,
  currentValue,
  onChange,
  min = 0,
  max = 5000,
  step = 50,
  color = 'red',
}: ExpenseSliderProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
      setInputValue(clamped.toString());
    } else {
      setInputValue(value.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const currentPercentage = max > min ? ((currentValue - min) / (max - min)) * 100 : 0;
  const diff = value - currentValue;

  const colorClasses = {
    red: {
      gradient: 'from-red-500 to-red-600',
      border: 'border-red-600',
      text: 'text-red-600',
      lightText: 'text-red-500',
      bg: 'bg-red-100',
    },
    orange: {
      gradient: 'from-orange-500 to-orange-600',
      border: 'border-orange-600',
      text: 'text-orange-600',
      lightText: 'text-orange-500',
      bg: 'bg-orange-100',
    },
    slate: {
      gradient: 'from-slate-500 to-slate-600',
      border: 'border-slate-600',
      text: 'text-slate-600',
      lightText: 'text-slate-500',
      bg: 'bg-slate-100',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Aktuell: {formatCurrency(currentValue)}</span>
          {diff !== 0 && (
            <span className={`text-xs font-medium ${diff < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ({diff > 0 ? '+' : ''}{formatCurrency(diff)})
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Current value marker */}
        {currentValue >= min && currentValue <= max && Math.abs(currentPercentage - percentage) > 3 && (
          <div
            className="absolute -top-1 w-0.5 h-4 bg-slate-400 z-10"
            style={{ left: `${currentPercentage}%` }}
          />
        )}

        {/* Slider track */}
        <div className="relative h-2 bg-slate-200 rounded-full">
          <div
            className={`absolute h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />

        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 ${colors.border} rounded-full shadow cursor-pointer pointer-events-none`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">€</span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className={`w-20 text-sm font-semibold ${colors.text} bg-transparent border-b border-slate-300 focus:border-current outline-none text-center`}
        />
        <button
          onClick={() => onChange(currentValue)}
          className="text-xs text-slate-400 hover:text-slate-600 underline"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
