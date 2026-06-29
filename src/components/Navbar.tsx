import React, { useState } from 'react';
import { Activity, HelpCircle, Terminal, Cpu, X, CheckCircle2, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <header className="border-b border-slate-800 dark:border-slate-800 border-gray-200 bg-slate-900/80 dark:bg-slate-900/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-bold">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-100 dark:text-slate-100 text-gray-900 tracking-tight">
                  Quant<span className="text-cyan-400">Pulse</span>
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-slate-800 dark:bg-slate-800 bg-gray-200 text-slate-300 dark:text-slate-300 text-gray-700 border border-slate-700 dark:border-slate-700 border-gray-300">
                  v2.0 Backtester
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 text-gray-500 hidden sm:block">
                Browser-Native 1s Sequential Price Backtest Engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-950/60 dark:bg-slate-950/60 bg-gray-100 px-3 py-1.5 rounded-lg border border-slate-800 dark:border-slate-800 border-gray-300 text-slate-300 dark:text-slate-300 text-gray-700 font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Pure Client-Side Engine</span>
            </div>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 bg-gray-200 hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-gray-300 text-slate-200 dark:text-slate-200 text-gray-800 border border-slate-700/80 dark:border-slate-700/80 border-gray-300 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800/80 dark:bg-slate-800/80 bg-gray-200 hover:bg-slate-700 dark:hover:bg-slate-700 hover:bg-gray-300 text-slate-200 dark:text-slate-200 text-gray-800 border border-slate-700/80 dark:border-slate-700/80 border-gray-300 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Rules & Docs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Rules Modal (unchanged) */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-800 dark:border-slate-800 border-gray-300 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 dark:border-slate-800 border-gray-300 flex items-center justify-between bg-slate-900/50 dark:bg-slate-900/50 bg-gray-100/50">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100 dark:text-slate-100 text-gray-900">Backtest Rules & JSON Specification</h3>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 dark:text-slate-400 text-gray-500 hover:text-slate-200 dark:hover:text-slate-200 hover:text-gray-700 p-1 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-300 dark:text-slate-300 text-gray-700 max-h-[75vh] overflow-y-auto">
              <div>
                <h4 className="font-semibold text-slate-100 dark:text-slate-100 text-gray-900 mb-1 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>JSON Input Format</span>
                </h4>
                <p className="text-slate-400 dark:text-slate-400 text-gray-500 text-xs leading-relaxed">
                  Upload a JSON object containing keys with numerical suffixes representing sequential 1-second price intervals. The engine automatically sorts keys numerically (e.g., <code className="text-cyan-300 bg-slate-950 dark:bg-slate-950 bg-gray-200 px-1 py-0.5 rounded font-mono">p1</code>, <code className="text-cyan-300 bg-slate-950 dark:bg-slate-950 bg-gray-200 px-1 py-0.5 rounded font-mono">p2</code>, ... <code className="text-cyan-300 bg-slate-950 dark:bg-slate-950 bg-gray-200 px-1 py-0.5 rounded font-mono">pN</code>).
                </p>
                <pre className="mt-2 bg-slate-950 dark:bg-slate-950 bg-gray-100 border border-slate-800 dark:border-slate-800 border-gray-300 p-3 rounded-xl font-mono text-xs text-slate-300 dark:text-slate-300 text-gray-700 overflow-x-auto">
{`{
  "p1": 100.0,
  "p2": 100.5,
  "p3": 101.2,
  "p4": 99.8,
  ...
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-slate-100 dark:text-slate-100 text-gray-900 mb-1 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Execution Rules</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 dark:text-slate-400 text-gray-500 ml-1">
                  <li><strong className="text-slate-200 dark:text-slate-200 text-gray-800">Starting Balance:</strong> Default $50.00 (Customizable)</li>
                  <li><strong className="text-slate-200 dark:text-slate-200 text-gray-800">Minimum Trade Size:</strong> Default $5.00 (Customizable)</li>
                  <li><strong className="text-slate-200 dark:text-slate-200 text-gray-800">Position Sizing:</strong> Only one position at a time (All-In on Buy, All-Out on Sell).</li>
                  <li><strong className="text-slate-200 dark:text-slate-200 text-gray-800">Transaction Fees:</strong> $0.00 (Zero fee assumption).</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-100 dark:text-slate-100 text-gray-900 mb-1 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Moving Average Crossover Strategy</span>
                </h4>
                <p className="text-slate-400 dark:text-slate-400 text-gray-500 text-xs leading-relaxed">
                  The strategy evaluates at each 1-second interval:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 dark:text-slate-400 text-gray-500 ml-1 mt-1">
                  <li><strong className="text-emerald-400">BUY Signal:</strong> When Fast MA (Period 5) crosses ABOVE Slow MA (Period 20).</li>
                  <li><strong className="text-rose-400">SELL Signal:</strong> When Fast MA (Period 5) crosses BELOW Slow MA (Period 20).</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 dark:border-slate-800 border-gray-300 bg-slate-950/60 dark:bg-slate-950/60 bg-gray-100/60 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
              >
                Got it, let's backtest
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};