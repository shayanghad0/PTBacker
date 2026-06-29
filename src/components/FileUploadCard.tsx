import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  FileJson,
  Sliders,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  XCircle,
  Database,
  Zap,
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../utils/sampleData';
import { BacktestConfig } from '../types';

// Strategy presets – these only change the config, not the data
const STRATEGY_PRESETS: Array<{
  id: string;
  name: string;
  description: string;
  config: Partial<BacktestConfig>;
}> = [
  {
    id: 'ma-crossover-5-20',
    name: 'MA Crossover (5/20)',
    description: 'Classic fast/slow MA crossover',
    config: { strategyType: 'ma_crossover', fastPeriod: 5, slowPeriod: 20 },
  },
  {
    id: 'ma-crossover-10-30',
    name: 'MA Crossover (10/30)',
    description: 'Smoother MA crossover',
    config: { strategyType: 'ma_crossover', fastPeriod: 10, slowPeriod: 30 },
  },
  {
    id: 'rsi-reversion',
    name: 'RSI Mean Reversion',
    description: 'Buy oversold (30), sell overbought (70)',
    config: {
      strategyType: 'rsi_reversion',
      rsiPeriod: 14,
      rsiBuyThreshold: 30,
      rsiSellThreshold: 70,
    },
  },
  {
    id: 'momentum-10',
    name: 'Momentum Breakout (10)',
    description: 'Breakout above/below 10-bar range',
    config: { strategyType: 'momentum_breakout', momentumLookback: 10 },
  },
  {
    id: 'momentum-20',
    name: 'Momentum Breakout (20)',
    description: 'Breakout above/below 20-bar range',
    config: { strategyType: 'momentum_breakout', momentumLookback: 20 },
  },
];

interface FileUploadCardProps {
  onRunBacktest: (jsonText: string, filename: string, config: BacktestConfig) => void;
  isLoading: boolean;
  error: string | null;
  activeFilename: string | null;
  currentConfig: BacktestConfig;
  onConfigChange: (newConfig: BacktestConfig) => void;
  onReset: () => void;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({
  onRunBacktest,
  isLoading,
  error,
  activeFilename,
  currentConfig,
  onConfigChange,
  onReset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear file input when activeFilename becomes null (after reset)
  useEffect(() => {
    if (!activeFilename && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [activeFilename]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onRunBacktest(content, file.name, currentConfig);
        // Clear input so the same file can be re-uploaded
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onRunBacktest(content, file.name, currentConfig);
        // Clear input (though drop doesn't affect input value, we do it for consistency)
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const updateConfig = (field: keyof BacktestConfig, value: number | string) => {
    const updated = { ...currentConfig, [field]: value };
    onConfigChange(updated);
  };

  const resetConfig = () => {
    onConfigChange({
      initialBalance: 50,
      minTradeSize: 5,
      fastPeriod: 5,
      slowPeriod: 20,
      strategyType: 'ma_crossover',
    });
  };

  // Load the first sample dataset (Bullish Tech Surge)
  const loadSampleData = () => {
    const defaultSample = SAMPLE_DATASETS[0];
    const jsonString = JSON.stringify(defaultSample.data);
    onRunBacktest(jsonString, `${defaultSample.id}.json`, currentConfig);
  };

  // Apply a strategy preset
  const applyStrategyPreset = (preset: typeof STRATEGY_PRESETS[0]) => {
    const newConfig = { ...currentConfig, ...preset.config };
    onConfigChange(newConfig);
  };

  return (
    <div className="bg-slate-900 dark:bg-slate-900 bg-white border border-slate-800 dark:border-slate-800 border-gray-300 rounded-2xl p-6 shadow-xl space-y-6 transition-colors">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 dark:border-slate-800 border-gray-300 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 dark:text-slate-100 text-gray-900 flex items-center space-x-2">
            <FileJson className="w-5 h-5 text-cyan-400" />
            <span>Price Data & Strategy Input</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 text-gray-500 mt-0.5">
            Upload custom JSON or pick a strategy preset
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              onReset();
              // Also clear file input immediately
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>

          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showConfig
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-slate-800 dark:bg-slate-800 bg-gray-200 border-slate-700 dark:border-slate-700 border-gray-300 text-slate-300 dark:text-slate-300 text-gray-700 hover:bg-slate-700/80'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Config Parameters</span>
            <span className="bg-slate-950 dark:bg-slate-950 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
              ${currentConfig.initialBalance} | MA({currentConfig.fastPeriod}/{currentConfig.slowPeriod})
            </span>
          </button>
        </div>
      </div>

      {/* Config Drawer */}
      {showConfig && (
        <div className="bg-slate-950/70 dark:bg-slate-950/70 bg-gray-100/70 border border-slate-800 dark:border-slate-800 border-gray-300 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800/80 dark:border-slate-800/80 border-gray-300/80 pb-3">
            <span className="text-xs font-semibold text-slate-300 dark:text-slate-300 text-gray-700 uppercase tracking-wider">
              Strategy & Execution Settings
            </span>
            <button
              onClick={resetConfig}
              className="flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-400 text-gray-500 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-gray-600 mb-1">
                Starting Balance ($)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={currentConfig.initialBalance}
                onChange={(e) =>
                  updateConfig('initialBalance', Math.max(1, parseFloat(e.target.value) || 50))
                }
                className="w-full bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 dark:text-slate-100 text-gray-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-gray-600 mb-1">
                Min Trade Size ($)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={currentConfig.minTradeSize}
                onChange={(e) =>
                  updateConfig('minTradeSize', Math.max(0.1, parseFloat(e.target.value) || 5))
                }
                className="w-full bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 dark:text-slate-100 text-gray-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-gray-600 mb-1">
                Fast MA Period
              </label>
              <input
                type="number"
                min="1"
                max={currentConfig.slowPeriod - 1}
                value={currentConfig.fastPeriod}
                onChange={(e) =>
                  updateConfig('fastPeriod', Math.max(1, parseInt(e.target.value, 10) || 5))
                }
                className="w-full bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 dark:text-slate-100 text-gray-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 dark:text-slate-400 text-gray-600 mb-1">
                Slow MA Period
              </label>
              <input
                type="number"
                min={currentConfig.fastPeriod + 1}
                value={currentConfig.slowPeriod}
                onChange={(e) =>
                  updateConfig('slowPeriod', Math.max(currentConfig.fastPeriod + 1, parseInt(e.target.value, 10) || 20))
                }
                className="w-full bg-slate-900 dark:bg-slate-900 bg-white border border-slate-700 dark:border-slate-700 border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 dark:text-slate-100 text-gray-900 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start space-x-3 text-rose-300 text-xs animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Backtest Error</p>
            <p className="mt-1 leading-relaxed text-rose-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Box with Sample Data button */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-800 dark:border-slate-800 border-gray-300 hover:border-slate-700 dark:hover:border-slate-700 hover:border-gray-400 bg-slate-950/40 dark:bg-slate-950/40 bg-gray-50/40 hover:bg-slate-950/80 dark:hover:bg-slate-950/80 hover:bg-gray-100/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="py-6 flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-300 dark:text-slate-300 text-gray-700">
              Parsing JSON & Running Backtest Engine...
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center space-y-2 cursor-pointer py-4 px-6 rounded-xl hover:bg-slate-800/30 dark:hover:bg-slate-800/30 hover:bg-gray-200/30 transition-colors w-full sm:w-auto"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-800 bg-gray-200 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5 text-slate-400 dark:text-slate-400 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200 dark:text-slate-200 text-gray-800 group-hover:text-cyan-400 transition-colors">
                  Click to upload JSON or drag & drop
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 text-gray-500 mt-0.5">
                  Keys like <code className="text-cyan-400 font-mono">"p1", "p2", ...</code>
                </p>
              </div>
              {activeFilename && !error && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium mt-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{activeFilename}</span>
                </div>
              )}
            </div>

            <div className="hidden sm:block w-px h-16 bg-slate-700 dark:bg-slate-700 bg-gray-300"></div>

            <div className="flex flex-col items-center space-y-2 py-4 px-6 w-full sm:w-auto">
              <button
                onClick={loadSampleData}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Sample Data</span>
              </button>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 text-gray-500">
                Loads "Bullish Tech Surge" preset
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Strategy Presets Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 text-gray-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Strategy Presets</span>
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-400 text-gray-500">
            Click to change strategy (uses current data)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {STRATEGY_PRESETS.map((preset) => {
            const isActive =
              currentConfig.strategyType === preset.config.strategyType &&
              (preset.config.fastPeriod === undefined ||
                currentConfig.fastPeriod === preset.config.fastPeriod) &&
              (preset.config.slowPeriod === undefined ||
                currentConfig.slowPeriod === preset.config.slowPeriod) &&
              (preset.config.momentumLookback === undefined ||
                currentConfig.momentumLookback === preset.config.momentumLookback);

            return (
              <div
                key={preset.id}
                onClick={() => applyStrategyPreset(preset)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-cyan-500/15 border-cyan-500 text-slate-100 dark:text-slate-100 text-gray-900 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 dark:bg-slate-950/60 bg-gray-100/60 border-slate-800 dark:border-slate-800 border-gray-300 hover:border-slate-700 dark:hover:border-slate-700 hover:border-gray-400 hover:bg-slate-900 dark:hover:bg-slate-900 hover:bg-gray-200 text-slate-300 dark:text-slate-300 text-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-100 dark:text-slate-100 text-gray-900 truncate">
                      {preset.name}
                    </h4>
                    {isActive && <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-400 text-gray-500 mt-1 line-clamp-2 leading-snug">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 dark:border-slate-800/80 border-gray-300/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 dark:text-slate-400 text-gray-500">
                    {preset.config.strategyType.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-cyan-400 text-[10px]">Apply</span>
                </div>
              </div>
            );
          })}
        </div>
        {!activeFilename && !error && (
          <p className="text-center text-[11px] text-slate-500 dark:text-slate-500 text-gray-400 mt-2">
            * Upload data or load sample first, then click a preset to change strategy
          </p>
        )}
      </div>
    </div>
  );
};