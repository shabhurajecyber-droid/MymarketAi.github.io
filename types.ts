export interface TimeframeData {
  timeframe: string;
  buyPercent: number;
  sellPercent: number;
}

export interface OptionStrategy {
  action: 'BUY CE' | 'BUY PE' | 'SELL CE' | 'SELL PE' | 'NO TRADE';
  strikePrice: string;
  expiry: string;
  reasoning: string;
  roiPotential: string;
}

export interface AnalysisResult {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: string;
  targetPrice: string;
  stopLoss: string;
  reasoning: string;
  keyLevels: string[];
  timeframeAnalysis: TimeframeData[];
  optionStrategy: OptionStrategy;
}

export interface LoadingState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  message?: string;
}
