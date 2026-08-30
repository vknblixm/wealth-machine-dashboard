import { Variants } from 'framer-motion';

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
};

export const moneyFlowVariants: Variants = {
  hidden: { opacity: 0, y: 0 },
  animate: {
    opacity: [0, 1, 0],
    y: [-100, 100],
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

export const pulseVariants: Variants = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(0, 255, 65, 0.4)',
      '0 0 0 10px rgba(0, 255, 65, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

export const glitchVariants: Variants = {
  animate: {
    x: [0, -2, 2, -2, 0],
    transition: {
      duration: 0.3,
      repeat: Infinity,
      repeatDelay: 4,
    },
  },
};
