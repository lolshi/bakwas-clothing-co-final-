import { useAvailableColorsFromVariants } from '@/hooks/useAvailableColorsFromVariants';

const { colors: availableColors, loading: colorsLoading } = useAvailableColorsFromVariants();

{/* Colors Section */}
<div className="mb-6">
  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
    <Palette className="w-4 h-4" /> Colours
  </h4>
  <div className="grid grid-cols-6 gap-2">
    {availableColors.map(color => (
      <button
        key={color.hex}
        onClick={() => handleColorChange(color.hex, !filters.colors.includes(color.hex))}
        className={`relative w-6 h-6 rounded-full border-2 transition-all group ${
          filters.colors.includes(color.hex)
            ? 'border-neon-pink shadow-[0_0_8px_rgba(236,72,153,0.6)]'
            : 'border-white/30 hover:border-white/60'
        }`}
        style={{ backgroundColor: color.hex }}
        title={color.displayName}
        aria-pressed={filters.colors.includes(color.hex)}
      >
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
          {color.displayName}
        </div>
      </button>
    ))}
    {availableColors.length === 0 && !colorsLoading && (
      <div className="col-span-6 text-center py-8">
        <p className="text-gray-400 text-sm">No colors found</p>
      </div>
    )}
    {colorsLoading && (
      <div className="col-span-6 text-center py-8">
        <p className="text-gray-400 text-sm">Loading colors...</p>
      </div>
    )}
  </div>
</div> 