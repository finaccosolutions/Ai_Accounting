// src/components/ui/Input.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
  inputSize?: 'sm' | 'md' | 'lg';
  success?: boolean;
  floatingLabel?: boolean; // New prop for floating label
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  variant = 'default',
  inputSize = 'md',
  success = false,
  floatingLabel = false, // Default to false
  ...props
}) => {
  const baseClasses = 'block w-full rounded-2xl shadow-sm transition-all duration-300 ease-out focus:outline-none focus:ring-4 placeholder-gray-400';

  const variants = {
    default: 'border-2 border-gray-200/60 bg-white/80 backdrop-blur-sm hover:border-gray-300 focus:border-teal-400 focus:ring-emerald-100/50 hover:shadow-md focus:shadow-lg',
    filled: 'border-0 bg-gray-100/80 hover:bg-gray-200/80 focus:bg-white focus:ring-emerald-100/50 focus:shadow-lg',
    outline: 'border-2 border-gray-300 bg-transparent hover:border-gray-400 focus:border-emerald-500 focus:ring-emerald-100/50'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base'
  };

  const floatingLabelSizes = {
    sm: 'pt-6 pb-2',
    md: 'pt-7 pb-3',
    lg: 'pt-8 pb-4'
  };

  const stateClasses = error
    ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-200/50'
    : success
    ? 'border-emerald-400 bg-emerald-50/50 focus:border-emerald-500 focus:ring-emerald-200/50'
    : variants[variant];

  return (
    <div className="w-full">
      {!floatingLabel && label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${floatingLabel ? 'top-1/2 -translate-y-1/2' : ''}`}>
            <div className="text-gray-400">
              {icon}
            </div>
          </div>
        )}
        {floatingLabel && label && (
          <label
            htmlFor={props.id || props.name}
            className={clsx(
              "absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 ease-out pointer-events-none",
              "peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-600",
              "peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-blue-600",
              icon && "left-12"
            )}
          >
            {label}
          </label>
        )}
        <motion.input
          whileFocus={{ scale: 1.02 }}
          className={clsx(
            baseClasses,
            stateClasses,
            sizes[inputSize],
            icon && 'pl-12',
            floatingLabel && floatingLabelSizes[inputSize], // Add padding for floating label
            floatingLabel && "peer placeholder-transparent", // Add peer class for floating label
            className
          )}
          placeholder={floatingLabel ? label : props.placeholder} // Use label as placeholder for floating
          id={props.id || props.name} // Ensure ID is set for label htmlFor
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
      {success && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-emerald-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Looks good!
        </motion.p>
      )}
    </div>
  );
};
