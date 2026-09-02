'use client';

import * as RadixSlider from '@radix-ui/react-slider';
import { motion } from 'framer-motion';

interface CustomSliderProps extends Omit<RadixSlider.SliderProps, 'onValueChange' | 'value' | 'onChange'> {
  onChange?: (value: number) => void;
  value?: number;
}

export function Slider({ onChange, value, ...props }: CustomSliderProps) {
  return (
    <RadixSlider.Root
      {...props}
      value={value !== undefined ? [value] : undefined}
      onValueChange={(value) => onChange?.(value[0])}
      className="relative flex w-full items-center select-none touch-none"
    >
      <RadixSlider.Track className="relative h-1.5 grow rounded-full bg-dark-surface border border-neon-green/20">
        <RadixSlider.Range className="absolute h-full rounded-full bg-gradient-to-r from-neon-green to-neon-blue" />
      </RadixSlider.Track>
      <motion.div whileHover={{ scale: 1.2 }}>
        <RadixSlider.Thumb className="block h-5 w-5 rounded-full bg-neon-green shadow-lg cursor-pointer hover:bg-neon-green" />
      </motion.div>
    </RadixSlider.Root>
  );
}
