'use client';

import { useState, useEffect } from 'react';
import { classNames, formatCurrency } from '@/lib/utils';

interface IncomeSliderProps {
  value: number;
  onChange: (value: number) => void;
  currentIncome: number;
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
}

export default function IncomeSlider({
  value,
  onChange,
  currentIncome,
  min = 1000,
  max = 15000,
  step = 100,
  presets = [2500, 4000, 6000, 8000, 10000],
}: IncomeSliderProps) {
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

  const percentage = ((value - min) / (max - min)) * 100;
  const currentPercentage = ((currentIncome - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      {/* Slider with current income marker */}
      <div className="relative">
        {/* Current income marker */}
        {currentIncome >= min && currentIncome <= max && (
          <div
            className="absolute -top-6 flex flex-col items-center"
            style={{ left: `calc(${currentPercentage}% - 2px)` }}
          >
            <span className="text-xs text-slate-500 whitespace-nowrap">Aktuell</span>
            <div className="w-0.5 h-3 bg-slate-400" />
          </div>
        )}

        {/* Slider track background */}
        <div className="relative h-3 bg-slate-200 rounded-full">
          {/* Filled portion */}
          <div
            className="absolute h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
            style={{ width: `${percentage}%` }}
          />

          {/* Current income line */}
          {currentIncome >= min && currentIncome <= max && (
            <div
              className="absolute top-0 w-0.5 h-full bg-slate-500"
              style={{ left: `${currentPercentage}%` }}
            />
          )}
        </div>

        {/* Range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
        />

        {/* Custom slider thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-indigo-600 rounded-full shadow-lg cursor-pointer pointer-events-none"
          style={{ left: `calc(${percentage}% - 12px)` }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-sm text-slate-500">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>

      {/* Values display */}
      <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Aktuell</p>
          <p className="text-lg font-semibold text-slate-700">{formatCurrency(currentIncome)}</p>
        </div>
        <div className="text-2xl text-slate-300">→</div>
        <div className="text-center">
          <p className="text-xs text-indigo-600 uppercase tracking-wide font-medium">Simuliert</p>
          <div className="flex items-center gap-2">
            <span className="text-lg text-slate-400">€</span>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="w-24 text-xl font-bold text-indigo-600 bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 outline-none text-center"
            />
          </div>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={classNames(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              value === preset
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            )}
          >
            {formatCurrency(preset)}
          </button>
        ))}
        {/* Reset to current button */}
        <button
          onClick={() => onChange(currentIncome)}
          className={classNames(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            value === currentIncome
              ? 'bg-slate-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
          )}
        >
          Aktuell
        </button>
      </div>
    </div>
  );
}
