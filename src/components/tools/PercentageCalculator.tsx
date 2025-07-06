import React, { useState } from 'react';
import { RotateCcw, Percent } from 'lucide-react';

export const PercentageCalculator: React.FC = () => {
  const [calcType, setCalcType] = useState('basic');
  const [values, setValues] = useState({
    value: '',
    percentage: '',
    total: '',
    original: '',
    increase: '',
    decrease: ''
  });

  const handleClear = () => {
    setValues({
      value: '',
      percentage: '',
      total: '',
      original: '',
      increase: '',
      decrease: ''
    });
  };

  const updateValue = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  // Basic percentage calculations
  const calculateBasic = () => {
    const val = parseFloat(values.value) || 0;
    const pct = parseFloat(values.percentage) || 0;
    return (val * pct) / 100;
  };

  const calculateWhatPercent = () => {
    const val = parseFloat(values.value) || 0;
    const total = parseFloat(values.total) || 0;
    return total !== 0 ? (val / total) * 100 : 0;
  };

  const calculatePercentageIncrease = () => {
    const original = parseFloat(values.original) || 0;
    const increase = parseFloat(values.increase) || 0;
    return original !== 0 ? ((increase - original) / original) * 100 : 0;
  };

  const calculatePercentageDecrease = () => {
    const original = parseFloat(values.original) || 0;
    const decrease = parseFloat(values.decrease) || 0;
    return original !== 0 ? ((original - decrease) / original) * 100 : 0;
  };

  const results = {
    basic: calculateBasic(),
    whatPercent: calculateWhatPercent(),
    increase: calculatePercentageIncrease(),
    decrease: calculatePercentageDecrease()
  };

  const calculators = [
    { id: 'basic', name: 'Basic Percentage', description: 'Calculate X% of Y' },
    { id: 'whatPercent', name: 'What Percent', description: 'X is what % of Y' },
    { id: 'increase', name: 'Percentage Increase', description: 'Increase from X to Y' },
    { id: 'decrease', name: 'Percentage Decrease', description: 'Decrease from X to Y' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Percentage Calculator</h1>
            <p className="text-gray-600 dark:text-gray-400">Calculate percentages, increases, and decreases</p>
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
          {/* Calculator Type Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calculator Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {calculators.map((calc) => (
                <button
                  key={calc.id}
                  onClick={() => setCalcType(calc.id)}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    calcType === calc.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-medium">{calc.name}</div>
                  <div className="text-sm opacity-70">{calc.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Forms */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            {calcType === 'basic' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <Percent className="w-5 h-5 inline mr-2" />
                  Basic Percentage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Value
                    </label>
                    <input
                      type="number"
                      value={values.value}
                      onChange={(e) => updateValue('value', e.target.value)}
                      placeholder="Enter value"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={values.percentage}
                        onChange={(e) => updateValue('percentage', e.target.value)}
                        placeholder="Enter percentage"
                        className="w-full pr-8 pl-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                </div>
                {(values.value && values.percentage) && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-blue-800 dark:text-blue-200 mb-1">
                        {values.percentage}% of {values.value} is:
                      </div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {results.basic.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {calcType === 'whatPercent' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <Percent className="w-5 h-5 inline mr-2" />
                  What Percent
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Value
                    </label>
                    <input
                      type="number"
                      value={values.value}
                      onChange={(e) => updateValue('value', e.target.value)}
                      placeholder="Enter value"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Total
                    </label>
                    <input
                      type="number"
                      value={values.total}
                      onChange={(e) => updateValue('total', e.target.value)}
                      placeholder="Enter total"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                {(values.value && values.total) && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-green-800 dark:text-green-200 mb-1">
                        {values.value} is {results.whatPercent.toFixed(2)}% of {values.total}
                      </div>
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {results.whatPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {calcType === 'increase' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <Percent className="w-5 h-5 inline mr-2" />
                  Percentage Increase
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original Value
                    </label>
                    <input
                      type="number"
                      value={values.original}
                      onChange={(e) => updateValue('original', e.target.value)}
                      placeholder="Enter original value"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Value
                    </label>
                    <input
                      type="number"
                      value={values.increase}
                      onChange={(e) => updateValue('increase', e.target.value)}
                      placeholder="Enter new value"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                {(values.original && values.increase) && (
                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-purple-800 dark:text-purple-200 mb-1">
                        Increase from {values.original} to {values.increase}:
                      </div>
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {results.increase >= 0 ? '+' : ''}{results.increase.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {calcType === 'decrease' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <Percent className="w-5 h-5 inline mr-2" />
                  Percentage Decrease
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original Value
                    </label>
                    <input
                      type="number"
                      value={values.original}
                      onChange={(e) => updateValue('original', e.target.value)}
                      placeholder="Enter original value"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Value
                    </label>
                    <input
                      type="number"
                      value={values.decrease}
                      onChange={(e) => updateValue('decrease', e.target.value)}
                      placeholder="Enter new value"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                {(values.original && values.decrease) && (
                  <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-orange-800 dark:text-orange-200 mb-1">
                        Decrease from {values.original} to {values.decrease}:
                      </div>
                      <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {results.decrease.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Examples */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Common Percentage Calculations
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>• <strong>Sales Tax:</strong> Add 8.25% to $100 = $108.25</p>
              <p>• <strong>Tip:</strong> 18% of $50 = $9.00</p>
              <p>• <strong>Discount:</strong> 25% off $80 = $20 discount, $60 final price</p>
              <p>• <strong>Grade:</strong> 85 out of 100 = 85%</p>
              <p>• <strong>Growth:</strong> From $100 to $120 = 20% increase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};