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

interface RGB {
  r: number;
  g: number;
  b: number;
}

type ColorMode = 'hsl' | 'rgb';

const STORAGE_KEY = 'contrast-grid-colors';

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

const hexToRgb = (hex: string): RGB => {
  const [r, g, b] = chroma(hex).rgb();
  return { r, g, b };
};

const rgbToHex = (rgb: RGB): string => {
  return chroma(rgb.r, rgb.g, rgb.b).hex();
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
      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
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
  const [rgb, setRgb] = useState<RGB>(hexToRgb(color));
  const [mode, setMode] = useState<ColorMode>('hsl');

  const position = {
    x: triggerRect ? Math.max(0, triggerRect.left + (triggerRect.width / 2) - 140) : 100,
    y: triggerRect ? Math.max(0, triggerRect.top - 390) : 100
  };

  const updateHsl = (newHsl: HSL) => {
    setHsl(newHsl);
    try {
      const newHex = hslToHex(newHsl);
      setRgb(hexToRgb(newHex));
      onChange(newHex);
    } catch (e) {
      console.error('Invalid color:', e);
    }
  };

  const updateRgb = (newRgb: RGB) => {
    setRgb(newRgb);
    try {
      const newHex = rgbToHex(newRgb);
      setHsl(hexToHsl(newHex));
      onChange(newHex);
    } catch (e) {
      console.error('Invalid color:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-[280px] border border-gray-200 dark:border-gray-700"
        style={{
          left: position.x,
          top: position.y,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute right-2 top-2">
          <button
            className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
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

          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                className={`px-3 py-1 text-sm rounded-l-lg ${
                  mode === 'hsl'
                    ? 'bg-slate-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setMode('hsl')}
              >
                HSL
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-r-lg ${
                  mode === 'rgb'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setMode('rgb')}
              >
                RGB
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {mode === 'hsl' ? (
              <>
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
              </>
            ) : (
              <>
                <ColorSlider
                  label="Red"
                  value={rgb.r}
                  min={0}
                  max={255}
                  onChange={(r) => updateRgb({ ...rgb, r })}
                />
                <ColorSlider
                  label="Green"
                  value={rgb.g}
                  min={0}
                  max={255}
                  onChange={(g) => updateRgb({ ...rgb, g })}
                />
                <ColorSlider
                  label="Blue"
                  value={rgb.b}
                  min={0}
                  max={255}
                  onChange={(b) => updateRgb({ ...rgb, b })}
                />
              </>
            )}
          </div>

          <div className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <div>HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</div>
            <div>RGB: {rgb.r}, {rgb.g}, {rgb.b}</div>
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

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('color-scheme');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedMode ? savedMode === 'dark' : systemPreference;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('color-scheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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
    // Reset to basic 1x1 black and white grid
    const newForegroundColors: ColorEntry[] = [
      { color: '#FFFFFF', label: 'White' }
    ];

    const newBackgroundColors: ColorEntry[] = [
      { color: '#000000', label: 'Black' }
    ];

    setForegroundColors(newForegroundColors);
    setBackgroundColors(newBackgroundColors);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      fg: newForegroundColors,
      bg: newBackgroundColors
    }));
  };

  const handleRandom = () => {
    // Generate 1 random foreground color
    const newForegroundColors: ColorEntry[] = [
      { color: chroma.random().hex(), label: 'Random' }
    ];

    // Generate 1 random background color
    const newBackgroundColors: ColorEntry[] = [
      { color: chroma.random().hex(), label: 'Random' }
    ];

    setForegroundColors(newForegroundColors);
    setBackgroundColors(newBackgroundColors);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      fg: newForegroundColors,
      bg: newBackgroundColors
    }));
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

  const handleDragStart = (e: React.DragEvent, index: number, type: 'column' | 'row') => {
    e.stopPropagation();
    if (type === 'column') {
      setDraggedIndex(index);
    } else {
      setDraggedRowIndex(index);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number, type: 'column' | 'row') => {
    e.preventDefault();
    if (type === 'column') {
      if (draggedIndex === null || draggedIndex === index) return;
      const newColors = [...foregroundColors];
      const draggedColor = newColors[draggedIndex];
      newColors.splice(draggedIndex, 1);
      newColors.splice(index, 0, draggedColor);
      setForegroundColors(newColors);
      setDraggedIndex(index);
    } else {
      if (draggedRowIndex === null || draggedRowIndex === index) return;
      const newColors = [...backgroundColors];
      const draggedColor = newColors[draggedRowIndex];
      newColors.splice(draggedRowIndex, 1);
      newColors.splice(index, 0, draggedColor);
      setBackgroundColors(newColors);
      setDraggedRowIndex(index);
    }
  };

  const handleDragEnd = (type: 'column' | 'row') => {
    if (type === 'column') {
      setDraggedIndex(null);
    } else {
      setDraggedRowIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-slate-800"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Contrast Grid Editor
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Enter colors (one per line) to see their contrast ratios. Add
              labels by using a comma after the color (e.g., "#FF0000, Red
              Button"). Click any color swatch to edit in HSL.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Background Colors (Rows):
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm"
                value={backgroundColors.map(formatColorValue).join("\n")}
                onChange={handleBackgroundChange}
                placeholder="Enter colors (one per line)"
              />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Foreground Colors (Columns):
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm"
                value={foregroundColors.map(formatColorValue).join("\n")}
                onChange={handleForegroundChange}
                placeholder="Enter colors (one per line) - Drag column headers to reorder"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
            <div className="relative">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Contrast Ratios
                      </th>
                      {foregroundColors.map((fgColor, index) => (
                        <th
                          key={index}
                          className="group border border-slate-200 dark:border-slate-700 p-2 min-w-[120px] bg-slate-50 dark:bg-slate-800 relative"
                        >
                          <div
                            className="absolute top-0 bottom-0 left-0 w-8 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
                            draggable="true"
                            onDragStart={(e) =>
                              handleDragStart(e, index, "column")
                            }
                            onDragOver={(e) =>
                              handleDragOver(e, index, "column")
                            }
                            onDragEnd={() => handleDragEnd("column")}
                          />
                          <div
                            className="absolute top-0 bottom-0 right-0 w-8 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
                            draggable="true"
                            onDragStart={(e) =>
                              handleDragStart(e, index, "column")
                            }
                            onDragOver={(e) =>
                              handleDragOver(e, index, "column")
                            }
                            onDragEnd={() => handleDragEnd("column")}
                          />
                          <div className="flex flex-col items-center gap-1 relative z-10">
                            <ColorSwatch
                              color={fgColor.color}
                              onClick={() => {
                                if (
                                  activeColorPicker?.type === "foreground" &&
                                  activeColorPicker.index === index
                                ) {
                                  setActiveColorPicker(null);
                                } else {
                                  setActiveColorPicker({
                                    type: "foreground",
                                    index,
                                  });
                                }
                              }}
                              dataIndex={`foreground-${index}`}
                            />
                            {fgColor.label && (
                              <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                {fgColor.label}
                              </span>
                            )}
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {fgColor.color}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {backgroundColors.map((bgColor, rowIndex) => (
                      <tr key={rowIndex} className="group">
                        <td className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] relative">
                          <div
                            className="absolute left-0 right-0 top-0 h-8 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
                            draggable="true"
                            onDragStart={(e) =>
                              handleDragStart(e, rowIndex, "row")
                            }
                            onDragOver={(e) =>
                              handleDragOver(e, rowIndex, "row")
                            }
                            onDragEnd={() => handleDragEnd("row")}
                          />
                          <div
                            className="absolute left-0 right-0 bottom-0 h-8 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
                            draggable="true"
                            onDragStart={(e) =>
                              handleDragStart(e, rowIndex, "row")
                            }
                            onDragOver={(e) =>
                              handleDragOver(e, rowIndex, "row")
                            }
                            onDragEnd={() => handleDragEnd("row")}
                          />
                          <div className="flex flex-col items-center gap-1 relative z-10">
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
                              <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                                {bgColor.label}
                              </span>
                            )}
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {bgColor.color}
                            </span>
                          </div>
                        </td>
                        {foregroundColors.map((fgColor, colIndex) => {
                          const ratio =
                            isValidColor(fgColor.color) &&
                            isValidColor(bgColor.color)
                              ? getRatio(fgColor.color, bgColor.color)
                              : 0;

                          return (
                            <td
                              key={colIndex}
                              className="border border-slate-200 dark:border-slate-700 p-4 min-w-[120px] min-h-[100px]"
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
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleRandom}
              className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              Random Colors
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
            >
              Clear All Colors
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border-slate-800 p-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Legend
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600 dark:text-emerald-500 font-bold">
                  AAA
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Contrast ratio ≥ 7.0
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sky-600 dark:text-sky-500 font-bold">
                  AA
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Contrast ratio ≥ 4.5
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-600 dark:text-red-500 font-bold">
                  ✕
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  Failed contrast ratio
                </span>
              </div>
            </div>
          </div>
        </div>
        <footer className="mt-8 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/miguelsolorio/contrast-grid-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <span>
              Built by{" "}
              <a
                href="https://miguelsolorio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                Miguel Solorio
              </a>{" "}
            </span>
          </div>
        </footer>
      </div>

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