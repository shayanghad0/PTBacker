import React, { useRef, useState } from 'react';
import { Upload, FileJson, Sliders, AlertCircle, CheckCircle, Download, RotateCcw, Sparkles } from 'lucide-react';
import { SAMPLE_DATASETS, SampleDataset, downloadJsonFile } from '../utils/sampleData';
import { BacktestConfig } from '../types';

interface FileUploadCardProps {
  onRunBacktest: (jsonText: string, filename: string, config: BacktestConfig) => void;
  isLoading: boolean;
  error: string | null;
  activeFilename: string | null;
  currentConfig: BacktestConfig;
  onConfigChange: (newConfig: BacktestConfig) => void;
}

export const FileUploadCard: React.FC<FileUploadCardProps> = ({
  onRunBacktest,
  isLoading,
  error,
  activeFilename,
  currentConfig,
  onConfigChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onRunBacktest(content, file.name, currentConfig);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

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
      }
    };
    reader.readAsText(file);
  };

  const handleSampleSelect = (dataset: SampleDataset) => {
    const jsonString = JSON.stringify(dataset.data);
    onRunBacktest(jsonString, `${dataset.id}.json`, currentConfig);
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
      strategyType: 'ma_crossover'
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <FileJson className="w-5 h-5 text-cyan-400" />
            <span>Price Data & Strategy Input</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload custom sequential JSON or pick a simulated market preset
          </p>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            showConfig
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/80'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Config Parameters</span>
          <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] font-mono">
            ${currentConfig.initialBalance} | MA({currentConfig.fastPeriod}/{currentConfig.slowPeriod})
          </span>
        </button>
      </div>

      {/* Config Drawer */}
      {showConfig && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Strategy & Execution Settings</span>
            <button
              onClick={resetConfig}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Starting Balance ($)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={currentConfig.initialBalance}
                onChange={(e) => updateConfig('initialBalance', Math.max(1, parseFloat(e.target.value) || 50))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Min Trade Size ($)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={currentConfig.minTradeSize}
                onChange={(e) => updateConfig('minTradeSize', Math.max(0.1, parseFloat(e.target.value) || 5))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Fast MA Period (bars)
              </label>
              <input
                type="number"
                min="1"
                max={currentConfig.slowPeriod - 1}
                value={currentConfig.fastPeriod}
                onChange={(e) => updateConfig('fastPeriod', Math.max(1, parseInt(e.target.value, 10) || 5))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Slow MA Period (bars)
              </label>
              <input
                type="number"
                min={currentConfig.fastPeriod + 1}
                value={currentConfig.slowPeriod}
                onChange={(e) => updateConfig('slowPeriod', Math.max(currentConfig.fastPeriod + 1, parseInt(e.target.value, 10) || 20))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
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

      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80'
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
            <p className="text-sm font-medium text-slate-300">Parsing JSON & Running Backtest Engine...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                Click to upload JSON file or drag & drop
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Must contain keys like <code className="text-cyan-400 font-mono">"p1", "p2", ..., "pN"</code>
              </p>
            </div>
            {activeFilename && !error && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mt-2">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Active Dataset: {activeFilename}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preset Datasets Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Preset Scenarios</span>
          </span>
          <span className="text-[11px] text-slate-400">Click any card to load & run simulation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {SAMPLE_DATASETS.map((dataset) => {
            const isActive = activeFilename === `${dataset.id}.json`;
            return (
              <div
                key={dataset.id}
                onClick={() => handleSampleSelect(dataset)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-cyan-500/15 border-cyan-500 text-slate-100 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-100 truncate">{dataset.name}</h4>
                    {isActive && <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                    {dataset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">{dataset.count}s interval</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadJsonFile(`${dataset.id}.json`, dataset.data);
                    }}
                    title="Download Sample JSON file"
                    className="text-slate-400 hover:text-cyan-400 flex items-center space-x-1 hover:bg-slate-800 px-1.5 py-0.5 rounded transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
