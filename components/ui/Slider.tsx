'use client';

import { Slider as BaseSlider, SliderProps as BaseSliderProps } from '@radix-ui/react-slider';
import { motion } from 'framer-motion';

interface SliderProps extends Omit<BaseSliderProps, 'onChange'> {
  onChange?: (value: number) => void;
}

export function Slider({ onChange, ...props }: SliderProps) {
  return (
    <BaseSlider
      {...props}
      onValueChange={(value) => onChange?.(value[0])}
      className="relative flex w-full items-center select-none touch-none"
    >
      <BaseSlider.Track className="relative h-1.5 grow rounded-full bg-dark-surface border border-neon-green/20">
        <BaseSlider.Range className="absolute h-full rounded-full bg-gradient-to-r from-neon-green to-neon-blue" />
      </BaseSlider.Track>
      <motion.div whileHover={{ scale: 1.2 }}>
        <BaseSlider.Thumb className="block h-5 w-5 rounded-full bg-neon-green shadow-lg cursor-pointer hover:bg-neon-green" />
      </motion.div>
    </BaseSlider>
  );
}
