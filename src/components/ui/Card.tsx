import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -2 } : {}}
      className={clsx(
        'bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg',
        hover && 'hover:shadow-xl transition-shadow duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  );
};