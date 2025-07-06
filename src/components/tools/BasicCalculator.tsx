import React, { useState } from 'react';
import { RotateCcw, Backpack as Backspace } from 'lucide-react';

export const BasicCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const buttons = [
    { label: 'C', action: clear, className: 'bg-red-500 hover:bg-red-600 text-white' },
    { label: '⌫', action: backspace, className: 'bg-gray-500 hover:bg-gray-600 text-white' },
    { label: '÷', action: () => performOperation('/'), className: 'bg-blue-500 hover:bg-blue-600 text-white' },
    { label: '×', action: () => performOperation('*'), className: 'bg-blue-500 hover:bg-blue-600 text-white' },
    
    { label: '7', action: () => inputNumber('7'), className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' },
    { label: '8', action: () => inputNumber('8'), className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' },
    { label: '9', action: () => inputNumber('9'), className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' },
    { label: '−', action: () => performOperation('-'), className: 'bg-blue-500 hover:bg-blue-600 text-white' },
    
    { label: '4', action: () => inputNumber('4'), className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' },
    { label: '5', action: () => inputNumber('5'), className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' },
    { label: '6', action: () => inputNumber('6'), className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' },
    { label: '+', action: () => performOperation('+'), className: 'bg-blue-500 hover:bg-blue-600 text-white' },
    
    { label: '1', action: () => inputNumber('1'), className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' },
    { label: '2', action: () => inputNumber('2'), className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' },
    { label: '3', action: () => inputNumber('3'), className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' },
    { label: '=', action: handleEquals, className: 'bg-green-500 hover:bg-green-600 text-white row-span-2' },
    
    { label: '0', action: () => inputNumber('0'), className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 col-span-2' },
    { label: '.', action: inputDecimal, className: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Basic Calculator</h1>
            <p className="text-gray-600 dark:text-gray-400">Perform basic arithmetic operations</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clear}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
            {/* Display */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white break-all">
                    {display}
                  </div>
                  {operation && previousValue !== null && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {previousValue} {operation}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {buttons.map((button, index) => (
                  <button
                    key={index}
                    onClick={button.action}
                    className={`
                      p-4 rounded-lg font-semibold text-lg transition-colors
                      ${button.className}
                      ${button.label === '=' ? 'row-span-2' : ''}
                      ${button.label === '0' ? 'col-span-2' : ''}
                    `}
                  >
                    {button.label === '⌫' ? <Backspace className="w-5 h-5 mx-auto" /> : button.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keyboard Shortcuts
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>• <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">0-9</kbd> Numbers</p>
              <p>• <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">+ - * /</kbd> Operations</p>
              <p>• <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">=</kbd> Equals</p>
              <p>• <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">.</kbd> Decimal point</p>
              <p>• <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Backspace</kbd> Delete</p>
              <p>• <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Escape</kbd> Clear</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};