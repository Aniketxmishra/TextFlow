import React, { useState } from 'react';
import { RotateCcw, Users, DollarSign } from 'lucide-react';

export const TipCalculator: React.FC = () => {
  const [billAmount, setBillAmount] = useState('');
  const [tipPercentage, setTipPercentage] = useState(18);
  const [numPeople, setNumPeople] = useState(1);
  const [customTip, setCustomTip] = useState('');

  const bill = parseFloat(billAmount) || 0;
  const tipPercent = customTip ? parseFloat(customTip) : tipPercentage;
  const tipAmount = bill * (tipPercent / 100);
  const totalAmount = bill + tipAmount;
  const perPersonAmount = totalAmount / numPeople;
  const tipPerPerson = tipAmount / numPeople;

  const handleClear = () => {
    setBillAmount('');
    setTipPercentage(18);
    setNumPeople(1);
    setCustomTip('');
  };

  const presetTips = [10, 15, 18, 20, 25];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tip Calculator</h1>
            <p className="text-gray-600 dark:text-gray-400">Calculate tips and split bills easily</p>
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
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bill Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bill Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Bill Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Number of People */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of People
                </label>
                <input
                  type="number"
                  value={numPeople}
                  onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Tip Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tip Percentage</h3>
            
            {/* Preset Tips */}
            <div className="grid grid-cols-5 gap-3 mb-4">
              {presetTips.map((tip) => (
                <button
                  key={tip}
                  onClick={() => {
                    setTipPercentage(tip);
                    setCustomTip('');
                  }}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    tipPercentage === tip && !customTip
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tip}%
                </button>
              ))}
            </div>

            {/* Custom Tip */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Tip Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={customTip}
                  onChange={(e) => setCustomTip(e.target.value)}
                  placeholder="Enter custom percentage"
                  className="w-full pr-8 pl-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  step="0.1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Results */}
          {bill > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calculation Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Summary */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bill Amount</span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${bill.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Tip ({tipPercent}%)
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        ${tipAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Amount</span>
                      <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Per Person */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Tip per Person
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        ${tipPerPerson.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        Total per Person
                      </span>
                      <span className="text-xl font-bold text-purple-900 dark:text-purple-100">
                        ${perPersonAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Split between {numPeople} {numPeople === 1 ? 'person' : 'people'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-2">
              Tipping Guidelines
            </h3>
            <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
              <p>• <strong>Restaurants:</strong> 18-20% for good service, 15% for average service</p>
              <p>• <strong>Bars:</strong> $1-2 per drink or 15-20% of the tab</p>
              <p>• <strong>Delivery:</strong> 10-15% or minimum $2-3</p>
              <p>• <strong>Taxi/Rideshare:</strong> 10-15% of the fare</p>
              <p>• <strong>Hair Salon:</strong> 15-20% of the service cost</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};