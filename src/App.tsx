import React, { useState } from 'react';
import chroma from 'chroma-js';

const getContrastClass = (ratio: number): string => {
  if (ratio >= 7) return 'passing-aaa';
  if (ratio >= 4.5) return 'passing-aa';
  return 'failing';
};

const App: React.FC = () => {
  const [foregroundColors, setForegroundColors] = useState<string[]>([
    '#FFFFFF',
    '#000000',
    '#FF0000',
  ]);
  const [backgroundColors, setBackgroundColors] = useState<string[]>([
    '#000000',
    '#FFFFFF',
    '#0000FF',
  ]);

  const handleForegroundChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const colors = e.target.value.split('\n').map(c => c.trim()).filter(Boolean);
    setForegroundColors(colors);
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const colors = e.target.value.split('\n').map(c => c.trim()).filter(Boolean);
    setBackgroundColors(colors);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contrast Grid Editor
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter colors (one per line) to see their contrast ratios. Values above 7.0 pass AAA, above 4.5 pass AA standards.
            </p>
          </div>

          {/* Color Inputs */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foreground Colors:
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                value={foregroundColors.join('\n')}
                onChange={handleForegroundChange}
                placeholder="Enter colors (one per line)"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Colors:
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                value={backgroundColors.join('\n')}
                onChange={handleBackgroundChange}
                placeholder="Enter colors (one per line)"
              />
            </div>
          </div>

          {/* Contrast Grid */}
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <div className="min-w-full divide-y divide-gray-200">
              {/* Header Row */}
              <div className="grid grid-flow-col auto-cols-fr">
                <div className="contrast-cell font-medium bg-gray-50">
                  Contrast Ratios
                </div>
                {backgroundColors.map((bgColor, index) => (
                  <div
                    key={index}
                    className="contrast-cell font-medium bg-gray-50"
                  >
                    {bgColor}
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              {foregroundColors.map((fgColor, rowIndex) => (
                <div key={rowIndex} className="grid grid-flow-col auto-cols-fr">
                  <div className="contrast-cell font-medium bg-gray-50">
                    {fgColor}
                  </div>
                  {backgroundColors.map((bgColor, colIndex) => {
                    const ratio = isValidColor(fgColor) && isValidColor(bgColor)
                      ? getRatio(fgColor, bgColor)
                      : 0;

                    return (
                      <div
                        key={colIndex}
                        className={`contrast-cell ${getContrastClass(ratio)}`}
                        style={{
                          backgroundColor: isValidColor(bgColor) ? bgColor : 'transparent',
                          color: isValidColor(fgColor) ? fgColor : 'inherit',
                        }}
                      >
                        {ratio.toFixed(2)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
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
    </div>
  );
};

export default App;