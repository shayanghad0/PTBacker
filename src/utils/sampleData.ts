export interface SampleDataset {
  id: string;
  name: string;
  description: string;
  count: number;
  data: Record<string, number>;
}

function generateDataset(
  name: string,
  description: string,
  count: number,
  generator: (index: number) => number
): SampleDataset {
  const data: Record<string, number> = {};
  for (let i = 1; i <= count; i++) {
    // Round to 2 decimal places for clean prices
    const val = Number(generator(i).toFixed(2));
    data[`p${i}`] = val;
  }
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name,
    description,
    count,
    data
  };
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  generateDataset(
    'Bullish Tech Surge',
    '300-second steady upward trend with minor pullbacks. Ideal for catching MA crossover momentum.',
    300,
    (i) => {
      const base = 100;
      const trend = i * 0.45; // up 135 over 300s
      const cycle = Math.sin(i / 12) * 4 + Math.cos(i / 5) * 2;
      return Math.max(10, base + trend + cycle);
    }
  ),
  generateDataset(
    'Volatile Sideways Chop',
    '400-second oscillating range ($95 - $115). Demonstrates false crossovers and whipsaw behavior.',
    400,
    (i) => {
      const base = 105;
      const majorWave = Math.sin(i / 18) * 8;
      const minorWave = Math.cos(i / 4) * 2.5;
      return base + majorWave + minorWave;
    }
  ),
  generateDataset(
    'Crypto Pump & Crash',
    '350-second volatile parabolic run followed by a sharp liquidation sell-off.',
    350,
    (i) => {
      if (i <= 180) {
        // Pump
        return 50 + Math.pow(i / 180, 2) * 150 + Math.sin(i / 6) * 3;
      } else {
        // Crash & Consolidation
        const decay = (i - 180) / 170;
        return Math.max(35, 200 - decay * 145 + Math.sin(i / 8) * 4);
      }
    }
  ),
  generateDataset(
    'Bear Market Descent',
    '250-second steady downtrend with brief dead-cat bounces.',
    250,
    (i) => {
      const base = 200;
      const drop = i * 0.55;
      const bounce = Math.sin(i / 14) * 6;
      return Math.max(15, base - drop + bounce);
    }
  ),
  generateDataset(
    'Quick 60-Sec Test',
    'Short 60-second test dataset with clear MA crossover signals.',
    60,
    (i) => {
      const base = 50;
      return base + Math.sin(i / 6) * 10 + (i * 0.3);
    }
  )
];

export function downloadJsonFile(filename: string, content: Record<string, number>): void {
  const jsonStr = JSON.stringify(content, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
