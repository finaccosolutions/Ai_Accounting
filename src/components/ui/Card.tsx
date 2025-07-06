import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'gradient' | 'glass' | 'neumorphic';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hover = false, 
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  interactive = false,
  onClick
}) => {
  const baseClasses = 'rounded-3xl transition-all duration-500 ease-out';
  
  const variants = {
    default: 'bg-white/90 backdrop-blur-xl border border-gray-100/50',
    gradient: 'bg-gradient-to-br from-white/95 via-blue-50/30 to-indigo-50/30 backdrop-blur-xl border border-blue-100/50',
    glass: 'bg-white/20 backdrop-blur-xl border border-white/30',
    neumorphic: 'bg-gradient-to-br from-gray-50 to-gray-100'
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadows = {
    none: '',
    sm: 'shadow-md',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl'
  };

  const hoverEffects = hover || interactive ? 'hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1' : '';
  const interactiveEffects = interactive ? 'cursor-pointer' : '';

  // Special shadow for neumorphic variant
  const neumorphicShadow = variant === 'neumorphic' ? {
    boxShadow: '20px 20px 60px #d1d5db, -20px -20px 60px #ffffff, inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
  } : {};

  const neumorphicHoverShadow = variant === 'neumorphic' && (hover || interactive) ? {
    ':hover': {
      boxShadow: '25px 25px 70px #d1d5db, -25px -25px 70px #ffffff, inset 0 0 0 1px rgba(255, 255, 255, 0.2)'
    }
  } : {};

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.02, y: -4 } : {}}
      whileTap={interactive ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={clsx(
        baseClasses,
        variants[variant],
        paddings[padding],
        shadows[shadow],
        hoverEffects,
        interactiveEffects,
        className
      )}
      style={{
        ...neumorphicShadow,
        ...neumorphicHoverShadow
      }}
    >
      {children}
    </motion.div>
  );
};