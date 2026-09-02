'use client';

interface NeonSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function NeonSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  className = '',
}: NeonSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative h-1.5 rounded-full bg-dark-surface border border-neon-green/20 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #00ff41, #00d9ff)',
            boxShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neon-green border-2 border-dark-bg shadow-lg pointer-events-none transition-all duration-200"
        style={{
          left: `calc(${percentage}% - 8px)`,
          boxShadow: '0 0 8px rgba(0, 255, 65, 0.6)',
        }}
      />
    </div>
  );
}
