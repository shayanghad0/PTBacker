import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FileUploadCard } from './components/FileUploadCard';
import { StatsGrid } from './components/StatsGrid';
import { PriceChart } from './components/PriceChart';
import { EquityChart } from './components/EquityChart';
import { TradesTable } from './components/TradesTable';
import { RawJsonModal } from './components/RawJsonModal';
import { parsePriceJson } from './utils/parser';
import { runBacktest, createMACrossoverStrategy, createRSIStrategy, createMomentumStrategy } from './utils/backtester';
import { SAMPLE_DATASETS } from './utils/sampleData';
import { BacktestResult, BacktestConfig, ParsedPriceData } from './types';
import { LineChart, Table, TrendingUp, Code, Activity, Layers, Upload, FileJson } from 'lucide-react';

export function App() {
  // Theme state (default dark)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Update root classes
    document.documentElement.classList.toggle('light-mode', newTheme === 'light');
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Apply theme class on mount and changes
  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const [parsedData, setParsedData] = useState<ParsedPriceData | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [activeFilename, setActiveFilename] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'equity' | 'trades'>('chart');
  const [showRawModal, setShowRawModal] = useState<boolean>(false);

  const [config, setConfig] = useState<BacktestConfig>({
    initialBalance: 50,
    minTradeSize: 5,
    fastPeriod: 5,
    slowPeriod: 20,
    strategyType: 'ma_crossover'
  });

  // Run backtest function
  const executeBacktestSimulation = (data: ParsedPriceData, currentConfig: BacktestConfig) => {
    try {
      let strategyFn;
      if (currentConfig.strategyType === 'ma_crossover') {
        strategyFn = createMACrossoverStrategy(currentConfig.fastPeriod, currentConfig.slowPeriod);
      } else if (currentConfig.strategyType === 'rsi_reversion') {
        strategyFn = createRSIStrategy(14, 32, 68);
      } else {
        strategyFn = createMomentumStrategy(currentConfig.momentumLookback || 10);
      }

      const result = runBacktest(
        data.prices,
        currentConfig.initialBalance,
        currentConfig.minTradeSize,
        strategyFn,
        data.keys,
        currentConfig
      );

      setBacktestResult(result);
      setError(null);
    } catch (err) {
      setError(`Backtest execution error: ${(err as Error).message}`);
    }
  };

  // Handle uploaded JSON text
  const handleRunBacktest = (jsonText: string, filename: string, newConfig: BacktestConfig) => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const parseRes = parsePriceJson(jsonText, newConfig.slowPeriod);
      if (!parseRes.success || !parseRes.data) {
        setError(parseRes.error || 'Failed to parse JSON file.');
        setIsLoading(false);
        return;
      }

      setParsedData(parseRes.data);
      setActiveFilename(filename);
      executeBacktestSimulation(parseRes.data, newConfig);
      setIsLoading(false);
    }, 150);
  };

  // When config changes, re-run backtest if data is already loaded
  const handleConfigChange = (newConfig: BacktestConfig) => {
    setConfig(newConfig);
    if (parsedData) {
      if (parsedData.prices.length < newConfig.slowPeriod) {
        setError(`Insufficient data: Loaded dataset has ${parsedData.prices.length} prices, but Slow MA period is ${newConfig.slowPeriod}.`);
        return;
      }
      executeBacktestSimulation(parsedData, newConfig);
    }
  };

  // Reset everything – clears all data and resets config to default, no auto-load
  const resetBacktest = () => {
    setParsedData(null);
    setBacktestResult(null);
    setActiveFilename(null);
    setError(null);
    setConfig({
      initialBalance: 50,
      minTradeSize: 5,
      fastPeriod: 5,
      slowPeriod: 20,
      strategyType: 'ma_crossover'
    });
  };

  return (
    <div className={`min-h-screen bg-slate-950 dark:bg-slate-950 bg-white text-slate-100 dark:text-slate-100 text-gray-900 flex flex-col selection:bg-cyan-500 selection:text-slate-950 transition-colors`}>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <FileUploadCard
            onRunBacktest={handleRunBacktest}
            isLoading={isLoading}
            error={error}
            activeFilename={activeFilename}
            currentConfig={config}
            onConfigChange={handleConfigChange}
            onReset={resetBacktest}
          />
        </section>

        {!backtestResult || !parsedData || error ? (
          <section className="animate-fadeIn">
            <div className="bg-slate-900/50 dark:bg-slate-900/50 bg-white/50 border border-slate-800 dark:border-slate-800 border-gray-300 rounded-2xl p-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 dark:bg-slate-800/50 bg-gray-200/50 flex items-center justify-center">
                  <FileJson className="w-8 h-8 text-slate-400 dark:text-slate-400 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-200 dark:text-slate-200 text-gray-800">No Data Loaded</h3>
                <p className="text-sm text-slate-400 dark:text-slate-400 text-gray-500 max-w-md">
                  Upload a JSON file with sequential price keys <code className="text-cyan-400 font-mono">(p1, p2, ... pN)</code> or click one of the <strong className="text-slate-200 dark:text-slate-200 text-gray-700">Sample Data</strong> buttons below to start backtesting.
                </p>
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-slate-500 text-gray-400 bg-slate-950/50 dark:bg-slate-950/50 bg-gray-100/50 px-4 py-2 rounded-xl border border-slate-800/50 dark:border-slate-800/50 border-gray-300/50">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>0 prices loaded — upload or select a preset</span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 text-gray-900 tracking-tight">
                  Backtest Simulation Results
                </h2>
              </div>
              <button
                onClick={() => setShowRawModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-900 bg-gray-200 hover:bg-slate-800 dark:hover:bg-slate-800 border border-slate-800 dark:border-slate-800 border-gray-300 text-slate-300 dark:text-slate-300 text-gray-700 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspect Raw JSON ({parsedData.keys.length} bars)</span>
              </button>
            </div>

            <StatsGrid result={backtestResult} />

            <div className="border-b border-slate-800 dark:border-slate-800 border-gray-300 flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'chart'
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5 rounded-t-xl'
                      : 'border-transparent text-slate-400 dark:text-slate-400 text-gray-600 hover:text-slate-200'
                  }`}
                >
                  <LineChart className="w-4 h-4" />
                  <span>Price & MA Signal Chart</span>
                </button>
                <button
                  onClick={() => setActiveTab('equity')}
                  className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'equity'
                      ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5 rounded-t-xl'
                      : 'border-transparent text-slate-400 dark:text-slate-400 text-gray-600 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Portfolio Equity Curve</span>
                </button>
                <button
                  onClick={() => setActiveTab('trades')}
                  className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'trades'
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5 rounded-t-xl'
                      : 'border-transparent text-slate-400 dark:text-slate-400 text-gray-600 hover:text-slate-200'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Trades Table</span>
                  <span className="bg-slate-800 dark:bg-slate-800 bg-gray-300 text-slate-300 dark:text-slate-300 text-gray-700 font-mono text-[10px] px-2 py-0.5 rounded-full">
                    {backtestResult.totalTrades}
                  </span>
                </button>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-slate-400 dark:text-slate-400 text-gray-600">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Strategy: {config.strategyType.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>

            <div className="transition-all">
              {activeTab === 'chart' && (
                <PriceChart timeline={backtestResult.timeline} fastPeriod={config.fastPeriod} slowPeriod={config.slowPeriod} />
              )}
              {activeTab === 'equity' && (
                <EquityChart timeline={backtestResult.timeline} initialBalance={config.initialBalance} />
              )}
              {activeTab === 'trades' && (
                <TradesTable trades={backtestResult.trades} strategyType={config.strategyType} config={config} />
              )}
            </div>
          </section>
        )}
      </main>

      {showRawModal && parsedData && (
        <RawJsonModal
          keys={parsedData.keys}
          prices={parsedData.prices}
          filename={activeFilename}
          onClose={() => setShowRawModal(false)}
        />
      )}

      <footer className="border-t border-slate-900 dark:border-slate-900 border-gray-200 bg-slate-950 dark:bg-slate-950 bg-white py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-500 text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Quant<span className="text-slate-400 dark:text-slate-400 text-gray-700 font-medium">Pulse</span> Client-Side Backtesting Terminal • Powered by React, Vite & TypeScript
          </p>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>$0 Transaction Fees</span>
            <span>All-in/All-out Sizing</span>
            <span>Strict Numerical Suffix Sort</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;