import React from 'react';
import { Input } from './Input';

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number | string;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  showControls?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  showControls = true,
  className = '',
  ...props
}) => {
  const handleIncrement = () => {
    const currentValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    const newValue = currentValue + step;
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const currentValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    const newValue = currentValue - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(newValue);
  };

  return (
    <div className="relative">
      <Input
        {...props}
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        className={`${showControls ? 'pr-8' : ''} ${className}`}
      />
      {showControls && (
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
          <button
            type="button"
            onClick={handleIncrement}
            className="w-6 h-4 bg-gray-200 hover:bg-gray-300 rounded-t text-xs flex items-center justify-center transition-colors border border-gray-300"
            tabIndex={-1}
          >
            <span className="text-gray-600 text-xs leading-none">▲</span>
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="w-6 h-4 bg-gray-200 hover:bg-gray-300 rounded-b text-xs flex items-center justify-center transition-colors border border-gray-300 border-t-0"
            tabIndex={-1}
          >
            <span className="text-gray-600 text-xs leading-none">▼</span>
          </button>
        </div>
      )}
    </div>
  );
};