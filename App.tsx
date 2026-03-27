/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, RotateCcw, Equal, Divide, X, Minus, Plus, Percent } from 'lucide-react';

type ButtonType = 'number' | 'operator' | 'action' | 'equals';

interface CalcButtonProps {
  label: string | React.ReactNode;
  value: string;
  type: ButtonType;
  onClick: (val: string) => void;
  className?: string;
}

const CalcButton = ({ label, value, type, onClick, className = "" }: CalcButtonProps) => {
  const getBgColor = () => {
    switch (type) {
      case 'operator': return 'bg-orange-100 text-orange-600 hover:bg-orange-200';
      case 'action': return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
      case 'equals': return 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200';
      default: return 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-100';
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick(value)}
      className={`h-16 rounded-2xl flex items-center justify-center text-xl font-medium transition-colors ${getBgColor()} ${className}`}
    >
      {label}
    </motion.button>
  );
};

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [lastResult, setLastResult] = useState<string | null>(null);

  const calculate = useCallback(() => {
    try {
      // Replace symbols for evaluation
      const sanitizedExpression = expression.replace(/x/g, '*').replace(/÷/g, '/');
      // Using Function constructor as a safer alternative to eval for simple math
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${sanitizedExpression}`)();
      
      const formattedResult = Number.isInteger(result) 
        ? result.toString() 
        : parseFloat(result.toFixed(8)).toString();
      
      setDisplay(formattedResult);
      setLastResult(formattedResult);
      setExpression(formattedResult);
    } catch (error) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1500);
    }
  }, [expression]);

  const handleInput = useCallback((val: string) => {
    if (val === 'AC') {
      setDisplay('0');
      setExpression('');
      setLastResult(null);
      return;
    }

    if (val === 'C') {
      if (expression.length > 0) {
        const newExpr = expression.slice(0, -1);
        setExpression(newExpr);
        setDisplay(newExpr || '0');
      }
      return;
    }

    if (val === '=') {
      if (expression) calculate();
      return;
    }

    if (val === '%') {
      try {
        const result = (parseFloat(display) / 100).toString();
        setDisplay(result);
        setExpression(result);
      } catch {
        setDisplay('Error');
      }
      return;
    }

    // Handle operators
    if (['+', '-', 'x', '÷'].includes(val)) {
      if (!expression && val !== '-') return;
      
      const lastChar = expression.slice(-1);
      if (['+', '-', 'x', '÷'].includes(lastChar)) {
        setExpression(expression.slice(0, -1) + val);
      } else {
        setExpression(expression + val);
      }
      return;
    }

    // Handle numbers and decimal
    if (lastResult && !['+', '-', 'x', '÷'].includes(val)) {
      setExpression(val);
      setDisplay(val);
      setLastResult(null);
    } else {
      const newExpr = expression + val;
      setExpression(newExpr);
      
      // Update display with current number being typed
      const parts = newExpr.split(/[+\-x÷]/);
      setDisplay(parts[parts.length - 1] || '0');
    }
  }, [expression, calculate, display, lastResult]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleInput(e.key);
      if (e.key === '.') handleInput('.');
      if (e.key === '+') handleInput('+');
      if (e.key === '-') handleInput('-');
      if (e.key === '*') handleInput('x');
      if (e.key === '/') handleInput('÷');
      if (e.key === 'Enter' || e.key === '=') handleInput('=');
      if (e.key === 'Backspace') handleInput('C');
      if (e.key === 'Escape') handleInput('AC');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[360px] bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Display Area */}
        <div className="p-8 pb-4 flex flex-col items-end justify-end min-h-[200px] bg-white">
          <div className="text-gray-400 text-sm font-medium mb-2 h-6 overflow-hidden text-right w-full">
            <AnimatePresence mode="wait">
              <motion.span
                key={expression}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                {expression || ' '}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="text-gray-900 text-6xl font-light tracking-tight truncate w-full text-right">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-6 grid grid-cols-4 gap-3 bg-gray-50/50">
          <CalcButton label="AC" value="AC" type="action" onClick={handleInput} />
          <CalcButton label={<RotateCcw size={20} />} value="C" type="action" onClick={handleInput} />
          <CalcButton label={<Percent size={20} />} value="%" type="action" onClick={handleInput} />
          <CalcButton label={<Divide size={20} />} value="÷" type="operator" onClick={handleInput} />

          <CalcButton label="7" value="7" type="number" onClick={handleInput} />
          <CalcButton label="8" value="8" type="number" onClick={handleInput} />
          <CalcButton label="9" value="9" type="number" onClick={handleInput} />
          <CalcButton label={<X size={20} />} value="x" type="operator" onClick={handleInput} />

          <CalcButton label="4" value="4" type="number" onClick={handleInput} />
          <CalcButton label="5" value="5" type="number" onClick={handleInput} />
          <CalcButton label="6" value="6" type="number" onClick={handleInput} />
          <CalcButton label={<Minus size={20} />} value="-" type="operator" onClick={handleInput} />

          <CalcButton label="1" value="1" type="number" onClick={handleInput} />
          <CalcButton label="2" value="2" type="number" onClick={handleInput} />
          <CalcButton label="3" value="3" type="number" onClick={handleInput} />
          <CalcButton label={<Plus size={20} />} value="+" type="operator" onClick={handleInput} />

          <CalcButton label="0" value="0" type="number" onClick={handleInput} className="col-span-2" />
          <CalcButton label="." value="." type="number" onClick={handleInput} />
          <CalcButton label={<Equal size={24} />} value="=" type="equals" onClick={handleInput} />
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-gray-50/50 flex justify-center">
          <div className="w-32 h-1.5 bg-gray-200 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
