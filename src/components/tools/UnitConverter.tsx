import React, { useState } from 'react';
import { RotateCcw, ArrowUpDown } from 'lucide-react';
import { convertUnits } from '../../utils/converters';

const unitCategories = {
  length: {
    name: 'Length',
    units: {
      mm: 'Millimeter',
      cm: 'Centimeter',
      m: 'Meter',
      km: 'Kilometer',
      in: 'Inch',
      ft: 'Foot',
      yd: 'Yard',
      mi: 'Mile'
    }
  },
  weight: {
    name: 'Weight',
    units: {
      mg: 'Milligram',
      g: 'Gram',
      kg: 'Kilogram',
      oz: 'Ounce',
      lb: 'Pound'
    }
  },
  temperature: {
    name: 'Temperature',
    units: {
      celsius: 'Celsius',
      fahrenheit: 'Fahrenheit',
      kelvin: 'Kelvin'
    }
  },
  area: {
    name: 'Area',
    units: {
      'mm²': 'Square Millimeter',
      'cm²': 'Square Centimeter',
      'm²': 'Square Meter',
      'km²': 'Square Kilometer',
      'in²': 'Square Inch',
      'ft²': 'Square Foot',
      'yd²': 'Square Yard',
      'mi²': 'Square Mile'
    }
  },
  volume: {
    name: 'Volume',
    units: {
      ml: 'Milliliter',
      l: 'Liter',
      'gal(US)': 'Gallon (US)',
      'gal(UK)': 'Gallon (UK)',
      qt: 'Quart',
      pt: 'Pint',
      cup: 'Cup',
      'fl oz': 'Fluid Ounce'
    }
  }
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const handleConvert = (value: string, from: string, to: string) => {
    if (!value || isNaN(Number(value))) {
      setToValue('');
      return;
    }

    const numValue = parseFloat(value);
    const converted = convertUnits(numValue, from, to, category);
    setToValue(converted.toString());
  };

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
    handleConvert(value, fromUnit, toUnit);
  };

  const handleFromUnitChange = (unit: string) => {
    setFromUnit(unit);
    handleConvert(fromValue, unit, toUnit);
  };

  const handleToUnitChange = (unit: string) => {
    setToUnit(unit);
    handleConvert(fromValue, fromUnit, unit);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const units = Object.keys(unitCategories[newCategory as keyof typeof unitCategories].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setFromValue('');
    setToValue('');
  };

  const handleSwapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  const handleClear = () => {
    setFromValue('');
    setToValue('');
  };

  const currentCategory = unitCategories[category as keyof typeof unitCategories];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unit Converter</h1>
            <p className="text-gray-600 dark:text-gray-400">Convert between different units of measurement</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Category Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(unitCategories).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryChange(key)}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    category === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Conversion */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Convert {currentCategory.name}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={fromValue}
                    onChange={(e) => handleFromValueChange(e.target.value)}
                    placeholder="Enter value"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => handleFromUnitChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {Object.entries(currentCategory.units).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex items-center justify-center lg:flex-col lg:justify-center">
                <button
                  onClick={handleSwapUnits}
                  className="p-3 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <ArrowUpDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </button>
              </div>

              {/* To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={toValue}
                    readOnly
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <select
                    value={toUnit}
                    onChange={(e) => handleToUnitChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {Object.entries(currentCategory.units).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Result Display */}
            {fromValue && toValue && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {fromValue} {currentCategory.units[fromUnit as keyof typeof currentCategory.units]} = {toValue} {currentCategory.units[toUnit as keyof typeof currentCategory.units]}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Reference */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Reference - {currentCategory.name}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {Object.entries(currentCategory.units).map(([key, name]) => (
                <div key={key} className="flex justify-between">
                  <span>{name}</span>
                  <span className="font-mono">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};