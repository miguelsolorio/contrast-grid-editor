import React, { useState, useEffect } from 'react';
import chroma from 'chroma-js';

interface ColorEntry {
  color: string;
  label?: string;
}

interface ColorPickerProps {
  color: string;
  onChange: (newColor: string) => void;
  onClose: () => void;
  triggerRect?: DOMRect;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = 'contrast-grid-colors';

const getContrastClass = (ratio: number): string => {
  if (ratio >= 7) return 'passing-aaa';
  if (ratio >= 4.5) return 'passing-aa';
  return 'failing';
};

const getContrastLabel = (ratio: number): JSX.Element | string => {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return <span className="text-red-600 font-bold">✕</span>;
};

const parseColorInput = (input: string): ColorEntry => {
  const [colorPart, ...labelParts] = input.split(',');
  const trimmedColor = colorPart.trim();

  // If it looks like a hex color without #, add it
  const color = /^[0-9A-Fa-f]{6}$/.test(trimmedColor) ? `#${trimmedColor}` : trimmedColor;
  const label = labelParts.length > 0 ? labelParts.join(',').trim() : undefined;

  return { color, label };
};

const hexToHsl = (hex: string): HSL => {
  const [h, s, l] = chroma(hex).hsl();
  return {
    h: Math.round(h || 0),
    s: Math.round((s || 0) * 100),
    l: Math.round((l || 0) * 100)
  };
};

const hslToHex = (hsl: HSL): string => {
  return chroma.hsl(hsl.h, hsl.s / 100, hsl.l / 100).hex();
};

const ColorSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, onChange }) => (
  <div className="space-y-1">
    <div className="flex justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <span className="text-sm text-gray-500">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full"
    />
  </div>
);

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, onClose, triggerRect }) => {
  const [hsl, setHsl] = useState<HSL>(hexToHsl(color));
  const position = {
    x: triggerRect ? Math.max(0, triggerRect.left + (triggerRect.width / 2) - 140) : 100,
    y: triggerRect ? Math.max(0, triggerRect.top - 330) : 100
  };

  const updateHsl = (newHsl: HSL) => {
    setHsl(newHsl);
    try {
      const newHex = hslToHex(newHsl);
      onChange(newHex);
    } catch (e) {
      console.error('Invalid color:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute bg-white rounded-lg shadow-2xl w-[280px] border border-gray-200/50"
        style={{
          left: position.x,
          top: position.y,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute right-2 top-2">
          <button
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={onClose}
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 h-16 rounded-lg shadow-inner" style={{ backgroundColor: color }} />

          <div className="space-y-3">
            <ColorSlider
              label="Hue"
              value={hsl.h}
              min={0}
              max={360}
              onChange={(h) => updateHsl({ ...hsl, h })}
            />
            <ColorSlider
              label="Saturation"
              value={hsl.s}
              min={0}
              max={100}
              onChange={(s) => updateHsl({ ...hsl, s })}
            />
            <ColorSlider
              label="Lightness"
              value={hsl.l}
              min={0}
              max={100}
              onChange={(l) => updateHsl({ ...hsl, l })}
            />
          </div>

          <div className="mt-3 space-y-1 text-xs text-gray-500">
            <div>HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</div>
            <div>HEX: {color.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ColorSwatch: React.FC<{ color: string; onClick: () => void; dataIndex: string }> = ({ color, onClick, dataIndex }) => (
  <div
    className="w-6 h-6 rounded border border-gray-200 shadow-sm cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
    style={{ backgroundColor: color }}
    onClick={onClick}
    data-color-index={dataIndex}
  />
);

const App: React.FC = () => {
  const [foregroundColors, setForegroundColors] = useState<ColorEntry[]>(() => {
    const savedColors = localStorage.getItem(STORAGE_KEY);
    if (savedColors) {
      try {
        const { fg } = JSON.parse(savedColors);
        return fg;
      } catch (e) {
        console.error('Error loading foreground colors:', e);
      }
    }
    return [
      { color: '#FFFFFF', label: 'White' },
      { color: '#000000', label: 'Black' },
      { color: '#FF0000', label: 'Red' },
    ];
  });

  const [backgroundColors, setBackgroundColors] = useState<ColorEntry[]>(() => {
    const savedColors = localStorage.getItem(STORAGE_KEY);
    if (savedColors) {
      try {
        const { bg } = JSON.parse(savedColors);
        return bg;
      } catch (e) {
        console.error('Error loading background colors:', e);
      }
    }
    return [
      { color: '#000000', label: 'Black' },
      { color: '#FFFFFF', label: 'White' },
      { color: '#0000FF', label: 'Blue' },
    ];
  });

  const [activeColorPicker, setActiveColorPicker] = useState<{
    type: 'foreground' | 'background';
    index: number;
  } | null>(null);

  // Save colors to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fg: foregroundColors,
        bg: backgroundColors
      }));
    } catch (e) {
      console.error('Error saving colors:', e);
    }
  }, [foregroundColors, backgroundColors]);

  const handleColorChange = (newColor: string) => {
    if (!activeColorPicker) return;

    if (activeColorPicker.type === 'foreground') {
      const newColors = [...foregroundColors];
      newColors[activeColorPicker.index] = {
        ...newColors[activeColorPicker.index],
        color: newColor
      };
      setForegroundColors(newColors);
      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fg: newColors,
        bg: backgroundColors
      }));
    } else {
      const newColors = [...backgroundColors];
      newColors[activeColorPicker.index] = {
        ...newColors[activeColorPicker.index],
        color: newColor
      };
      setBackgroundColors(newColors);
      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fg: foregroundColors,
        bg: newColors
      }));
    }
  };

  const handleForegroundChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const colors = e.target.value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(parseColorInput);
    setForegroundColors(colors);
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const colors = e.target.value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(parseColorInput);
    setBackgroundColors(colors);
  };

  const handleClear = () => {
    setForegroundColors([]);
    setBackgroundColors([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isValidColor = (color: string): boolean => {
    try {
      chroma(color);
      return true;
    } catch {
      return false;
    }
  };

  const getRatio = (color1: string, color2: string): number => {
    try {
      return chroma.contrast(color1, color2);
    } catch {
      return 0;
    }
  };

  const formatColorValue = (entry: ColorEntry): string => {
    return entry.label ? `${entry.color}, ${entry.label}` : entry.color;
  };

  // Calculate grid columns based on number of foreground colors
  const gridTemplateColumns = `300px repeat(${foregroundColors.length}, minmax(120px, 1fr))`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contrast Grid Editor
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter colors (one per line) to see their contrast ratios. Add
              labels by using a comma after the color (e.g., "#FF0000, Red
              Button"). Click any color swatch to edit in HSL.
            </p>
          </div>

          {/* Color Inputs */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Colors (Rows):
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                value={backgroundColors.map(formatColorValue).join("\n")}
                onChange={handleBackgroundChange}
                placeholder="Enter colors (one per line)"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foreground Colors (Columns):
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                value={foregroundColors.map(formatColorValue).join("\n")}
                onChange={handleForegroundChange}
                placeholder="Enter colors (one per line)"
              />
            </div>
          </div>

          {/* Contrast Grid */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="overflow-x-auto relative">
              <div className="inline-block min-w-full align-middle">
                <div className="divide-y divide-gray-200">
                  {/* Header Row */}
                  <div className="grid" style={{ gridTemplateColumns }}>
                    <div className="contrast-cell font-medium bg-gray-50 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      Contrast Ratios
                    </div>
                    {foregroundColors.map((fgColor, index) => (
                      <div
                        key={index}
                        className="contrast-cell font-medium bg-gray-50"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <ColorSwatch
                            color={fgColor.color}
                            onClick={() => {
                              if (
                                activeColorPicker?.type === "foreground" &&
                                activeColorPicker.index === index
                              ) {
                                setActiveColorPicker(null);
                              } else {
                                setActiveColorPicker({ type: "foreground", index });
                              }
                            }}
                            dataIndex={`foreground-${index}`}
                          />
                          {fgColor.label && (
                            <span className="font-medium text-gray-900">
                              {fgColor.label}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {fgColor.color}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Data Rows */}
                  {backgroundColors.map((bgColor, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="grid"
                      style={{ gridTemplateColumns }}
                    >
                      <div className="contrast-cell font-medium bg-gray-50 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="flex flex-col items-center gap-2">
                          <ColorSwatch
                            color={bgColor.color}
                            onClick={() => {
                              if (
                                activeColorPicker?.type === "background" &&
                                activeColorPicker.index === rowIndex
                              ) {
                                setActiveColorPicker(null);
                              } else {
                                setActiveColorPicker({
                                  type: "background",
                                  index: rowIndex,
                                });
                              }
                            }}
                            dataIndex={`background-${rowIndex}`}
                          />
                          {bgColor.label && (
                            <span className="font-medium text-gray-900">
                              {bgColor.label}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {bgColor.color}
                          </span>
                        </div>
                      </div>
                      {foregroundColors.map((fgColor, colIndex) => {
                        const ratio =
                          isValidColor(fgColor.color) && isValidColor(bgColor.color)
                            ? getRatio(fgColor.color, bgColor.color)
                            : 0;

                        return (
                          <div
                            key={colIndex}
                            className="contrast-cell"
                            style={{
                              backgroundColor: isValidColor(bgColor.color)
                                ? bgColor.color
                                : "transparent",
                              color: isValidColor(fgColor.color)
                                ? fgColor.color
                                : "inherit",
                            }}
                          >
                            <div className="flex flex-col items-center justify-center h-full">
                              <span className="text-lg font-bold">
                                {ratio.toFixed(2)}
                              </span>
                              <div className="text-xs mt-1">
                                {getContrastLabel(ratio)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Clear Button */}
          <div className="flex justify-end">
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Clear All Colors
            </button>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Legend</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-bold">AAA</span>
                <span className="text-gray-600">Contrast ratio ≥ 7.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-bold">AA</span>
                <span className="text-gray-600">Contrast ratio ≥ 4.5</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-600 font-bold">✕</span>
                <span className="text-gray-600">Failed contrast ratio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      {activeColorPicker && (
        <ColorPicker
          color={
            activeColorPicker.type === "foreground"
              ? foregroundColors[activeColorPicker.index].color
              : backgroundColors[activeColorPicker.index].color
          }
          onChange={handleColorChange}
          onClose={() => setActiveColorPicker(null)}
          triggerRect={document
            .querySelector(
              `[data-color-index="${activeColorPicker.type}-${activeColorPicker.index}"]`
            )
            ?.getBoundingClientRect()}
        />
      )}
    </div>
  );
};

export default App;