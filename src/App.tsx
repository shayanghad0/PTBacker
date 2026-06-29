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
import { LineChart, Table, TrendingUp, Code, Activity, Layers } from 'lucide-react';

export function App() {
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
  const executeBacktestSimulation = (
    data: ParsedPriceData,
    currentConfig: BacktestConfig
  ) => {
    try {
      let strategyFn;
      if (currentConfig.strategyType === 'ma_crossover') {
        strategyFn = createMACrossoverStrategy(currentConfig.fastPeriod, currentConfig.slowPeriod);
      } else if (currentConfig.strategyType === 'rsi_reversion') {
        strategyFn = createRSIStrategy(14, 32, 68);
      } else {
        strategyFn = createMomentumStrategy(10);
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
      // Validate slow period against available data length
      if (parsedData.prices.length < newConfig.slowPeriod) {
        setError(`Insufficient data: Loaded dataset has ${parsedData.prices.length} prices, but Slow MA period is ${newConfig.slowPeriod}.`);
        return;
      }
      executeBacktestSimulation(parsedData, newConfig);
    }
  };

  // Load default preset on startup
  useEffect(() => {
    const defaultPreset = SAMPLE_DATASETS[0];
    const jsonStr = JSON.stringify(defaultPreset.data);
    handleRunBacktest(jsonStr, `${defaultPreset.id}.json`, config);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top File Upload / Input Section */}
        <section>
          <FileUploadCard
            onRunBacktest={handleRunBacktest}
            isLoading={isLoading}
            error={error}
            activeFilename={activeFilename}
            currentConfig={config}
            onConfigChange={handleConfigChange}
          />
        </section>

        {/* Results Section */}
        {backtestResult && parsedData && !error && (
          <section className="space-y-6 animate-fadeIn">
            {/* Key Performance Indicators Grid */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                  Backtest Simulation Results
                </h2>
              </div>

              <button
                onClick={() => setShowRawModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspect Raw JSON ({parsedData.keys.length} bars)</span>
              </button>
            </div>

            <StatsGrid result={backtestResult} />

            {/* Navigation Tabs for Details */}
            <div className="border-b border-slate-800 flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'chart'
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5 rounded-t-xl'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
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
                      : 'border-transparent text-slate-400 hover:text-slate-200'
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
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Trades Table</span>
                  <span className="bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded-full">
                    {backtestResult.totalTrades}
                  </span>
                </button>
              </div>

              <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-slate-400">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Strategy: MA({config.fastPeriod}/{config.slowPeriod}) Crossover</span>
              </div>
            </div>

            {/* Tab Panels */}
            <div className="transition-all">
              {activeTab === 'chart' && (
                <PriceChart
                  timeline={backtestResult.timeline}
                  fastPeriod={config.fastPeriod}
                  slowPeriod={config.slowPeriod}
                />
              )}

              {activeTab === 'equity' && (
                <EquityChart
                  timeline={backtestResult.timeline}
                  initialBalance={config.initialBalance}
                />
              )}

              {activeTab === 'trades' && (
                <TradesTable trades={backtestResult.trades} />
              )}
            </div>
          </section>
        )}
      </main>

      {/* Raw JSON Modal */}
      {showRawModal && parsedData && (
        <RawJsonModal
          keys={parsedData.keys}
          prices={parsedData.prices}
          filename={activeFilename}
          onClose={() => setShowRawModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Quant<span className="text-slate-400 font-medium">Pulse</span> Client-Side Backtesting Terminal • Powered by React, Vite & TypeScript
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
