'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, className = '' }: AnimatedCounterProps) {
  const spring = useSpring(0, { stiffness: 40, damping: 20 });
  const display = useTransform(spring, (v) => {
    const num = Number(v);
    if (decimals > 0) return num.toFixed(decimals);
    return Math.round(num).toLocaleString();
  });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(String(v)));
    return unsubscribe;
  }, [display]);

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
