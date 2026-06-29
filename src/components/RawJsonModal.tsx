import React, { useState } from 'react';
import { X, Code, Copy, Check, FileText } from 'lucide-react';

interface RawJsonModalProps {
  keys: string[];
  prices: number[];
  filename: string | null;
  onClose: () => void;
}

export const RawJsonModal: React.FC<RawJsonModalProps> = ({ keys, prices, filename, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'table'>('json');

  const jsonObject = keys.reduce((acc, key, idx) => {
    acc[key] = prices[idx];
    return acc;
  }, {} as Record<string, number>);

  const jsonString = JSON.stringify(jsonObject, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Sorted Sequential Price Data ({keys.length} bars)
              </h3>
              <p className="text-xs text-slate-400">{filename || 'Loaded Dataset'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center space-x-1 text-xs">
              <button
                onClick={() => setViewMode('json')}
                className={`px-2.5 py-1 rounded-md font-mono cursor-pointer transition-colors ${
                  viewMode === 'json' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md font-mono cursor-pointer transition-colors ${
                  viewMode === 'table' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Table
              </button>
            </div>

            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {viewMode === 'json' ? (
            <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-cyan-300 overflow-x-auto leading-relaxed">
              {jsonString}
            </pre>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Sequential Index</th>
                    <th className="py-2.5 px-4">JSON Key</th>
                    <th className="py-2.5 px-4 text-right">Price ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {keys.map((k, i) => (
                    <tr key={k} className="hover:bg-slate-800/40">
                      <td className="py-2 px-4 text-slate-500">{i + 1}s</td>
                      <td className="py-2 px-4 font-bold text-cyan-400">{k}</td>
                      <td className="py-2 px-4 text-right font-semibold">${prices[i].toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Automatically sorted numerically by suffix number</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
