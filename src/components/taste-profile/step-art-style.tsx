'use client';

const ART_STYLES = [
  'Pixel Art',
  'Realistic 3D',
  'Cel-Shaded/Anime',
  'Stylized/Low-Poly',
  'Hand-Drawn/Painterly',
  'Minimalist',
];

interface StepArtStyleProps {
  values: Record<string, number>;
  onChange: (values: Record<string, number>) => void;
}

export function StepArtStyle({ values, onChange }: StepArtStyleProps) {
  const handleChange = (style: string, value: number) => {
    onChange({ ...values, [style]: value });
  };

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-100">
        Art style preferences
      </h2>
      <p className="mb-6 text-sm text-slate-400">
        Rate how much you enjoy each art style (1 = not at all, 10 = love it).
      </p>
      <div className="space-y-6">
        {ART_STYLES.map((style) => (
          <div key={style}>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                {style}
              </label>
              <span className="text-sm font-bold text-emerald-400">
                {values[style] || 5}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={values[style] || 5}
              onChange={(e) => handleChange(style, parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-emerald-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
