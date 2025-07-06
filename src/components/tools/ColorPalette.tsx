import React, { useState } from 'react';
import { Copy, RotateCcw, RefreshCw, Palette } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

interface Color {
  hex: string;
  rgb: string;
  hsl: string;
}

export const ColorPalette: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [paletteType, setPaletteType] = useState('complementary');
  const { copy, copied } = useClipboard();

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generatePalette = () => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const newColors: Color[] = [];

    const createColor = (h: number, s: number, l: number) => {
      const hex = hslToHex(h, s, l);
      const rgbValues = hexToRgb(hex);
      return {
        hex,
        rgb: rgbValues ? `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})` : '',
        hsl: `hsl(${h}, ${s}%, ${l}%)`
      };
    };

    switch (paletteType) {
      case 'complementary':
        newColors.push(createColor(hsl.h, hsl.s, hsl.l));
        newColors.push(createColor((hsl.h + 180) % 360, hsl.s, hsl.l));
        break;
      
      case 'triadic':
        newColors.push(createColor(hsl.h, hsl.s, hsl.l));
        newColors.push(createColor((hsl.h + 120) % 360, hsl.s, hsl.l));
        newColors.push(createColor((hsl.h + 240) % 360, hsl.s, hsl.l));
        break;
      
      case 'analogous':
        for (let i = -60; i <= 60; i += 30) {
          newColors.push(createColor((hsl.h + i + 360) % 360, hsl.s, hsl.l));
        }
        break;
      
      case 'monochromatic':
        for (let i = 0; i < 5; i++) {
          const lightness = Math.max(10, Math.min(90, hsl.l + (i - 2) * 20));
          newColors.push(createColor(hsl.h, hsl.s, lightness));
        }
        break;
      
      case 'tetradic':
        newColors.push(createColor(hsl.h, hsl.s, hsl.l));
        newColors.push(createColor((hsl.h + 90) % 360, hsl.s, hsl.l));
        newColors.push(createColor((hsl.h + 180) % 360, hsl.s, hsl.l));
        newColors.push(createColor((hsl.h + 270) % 360, hsl.s, hsl.l));
        break;
    }

    setColors(newColors);
  };

  const handleCopyColor = (color: Color, format: keyof Color) => {
    copy(color[format]);
  };

  const handleCopyPalette = () => {
    const paletteText = colors.map(color => 
      `${color.hex} | ${color.rgb} | ${color.hsl}`
    ).join('\n');
    copy(paletteText);
  };

  const handleClear = () => {
    setColors([]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Color Palette Generator</h1>
            <p className="text-gray-600 dark:text-gray-400">Generate harmonious color palettes and schemes</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Clear
            </button>
            <button
              onClick={handleCopyPalette}
              disabled={colors.length === 0}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Copy className="w-4 h-4 mr-2 inline" />
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Palette Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Palette Type
                </label>
                <select
                  value={paletteType}
                  onChange={(e) => setPaletteType(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="complementary">Complementary</option>
                  <option value="triadic">Triadic</option>
                  <option value="analogous">Analogous</option>
                  <option value="monochromatic">Monochromatic</option>
                  <option value="tetradic">Tetradic</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={generatePalette}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2 inline" />
                Generate Palette
              </button>
            </div>
          </div>

          {/* Generated Palette */}
          {colors.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Palette</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colors.map((color, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div
                        className="w-full h-24 rounded-lg mb-3 border border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: color.hex }}
                      />
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HEX</span>
                          <button
                            onClick={() => handleCopyColor(color, 'hex')}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-2 rounded">
                          {color.hex}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RGB</span>
                          <button
                            onClick={() => handleCopyColor(color, 'rgb')}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-2 rounded">
                          {color.rgb}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HSL</span>
                          <button
                            onClick={() => handleCopyColor(color, 'hsl')}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="text-sm font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-2 rounded">
                          {color.hsl}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {colors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <Palette className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg mb-2">No palette generated yet</p>
                <p className="text-sm">Choose a base color and palette type, then click "Generate Palette"</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-2">
              Color Harmony Types
            </h3>
            <div className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
              <p><strong>Complementary:</strong> Two colors opposite each other on the color wheel</p>
              <p><strong>Triadic:</strong> Three colors evenly spaced around the color wheel</p>
              <p><strong>Analogous:</strong> Colors that are adjacent to each other on the color wheel</p>
              <p><strong>Monochromatic:</strong> Different shades and tints of the same color</p>
              <p><strong>Tetradic:</strong> Four colors forming a rectangle on the color wheel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};