import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  showSpinners?: boolean;
  allowNegative?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  placeholder = "0",
  className = '',
  showSpinners = true,
  allowNegative = false
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseFloat(e.target.value) || 0;
    const clampedValue = Math.max(allowNegative ? -Infinity : min, Math.min(max || Infinity, inputValue));
    onChange(clampedValue);
  };

  const handleIncrement = () => {
    const newValue = value + step;
    const clampedValue = Math.min(max || Infinity, newValue);
    onChange(clampedValue);
  };

  const handleDecrement = () => {
    const newValue = value - step;
    const clampedValue = Math.max(allowNegative ? -Infinity : min, newValue);
    onChange(clampedValue);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="number"
        value={value || ''}
        onChange={handleInputChange}
        min={allowNegative ? undefined : min}
        max={max}
        step={step}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
      />
      {showSpinners && (
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
          <button
            type="button"
            onClick={handleIncrement}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronUp className="w-3 h-3 text-gray-500" />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
};