import React from 'react';
import { AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Target, ShieldAlert, Activity, Clock, BarChart3, Zap, DollarSign } from 'lucide-react';

interface Props {
  data: AnalysisResult;
}

const AnalysisDisplay: React.FC<Props> = ({ data }) => {
  const isBuy = data.action === 'BUY';
  const isSell = data.action === 'SELL';
  const isHold = data.action === 'HOLD';

  const mainColor = isBuy ? 'text-green-400' : isSell ? 'text-red-400' : 'text-yellow-400';
  const borderColor = isBuy ? 'border-green-500' : isSell ? 'border-red-500' : 'border-yellow-500';

  // Option Strategy Colors
  const isCall = data.optionStrategy?.action?.includes('CE') || data.optionStrategy?.action?.includes('BUY CE');
  const isPut = data.optionStrategy?.action?.includes('PE') || data.optionStrategy?.action?.includes('BUY PE');
  const optionColor = isCall ? 'bg-green-500/20 border-green-500' : isPut ? 'bg-red-500/20 border-red-500' : 'bg-gray-500/20 border-gray-500';

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* Header Card */}
      <div className={`backdrop-blur-xl bg-black/60 border-l-4 ${borderColor} p-6 rounded-r-xl shadow-2xl mb-6`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-1">शिफारस (Action)</h2>
            <div className={`text-5xl font-extrabold ${mainColor} drop-shadow-lg flex items-center gap-3`}>
              {isBuy && <TrendingUp className="w-12 h-12" />}
              {isSell && <TrendingDown className="w-12 h-12" />}
              {isHold && <Activity className="w-12 h-12" />}
              {data.action}
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-1">आत्मविश्वास (Confidence)</h2>
            <div className="text-4xl font-bold text-white flex items-center justify-end gap-2">
              {data.confidence}%
              <div className="w-16 h-16 relative flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                   <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-700" />
                   <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                     className={mainColor} 
                     strokeDasharray={175.9} 
                     strokeDashoffset={175.9 - (175.9 * data.confidence) / 100} 
                   />
                 </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Targets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-blue-300">
            <Activity size={18} />
            <span className="font-semibold uppercase text-xs tracking-wider">एंट्री (Entry)</span>
          </div>
          <p className="text-2xl font-mono text-white">{data.entryPrice}</p>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-green-300">
            <Target size={18} />
            <span className="font-semibold uppercase text-xs tracking-wider">टारगेट (Target)</span>
          </div>
          <p className="text-2xl font-mono text-white">{data.targetPrice}</p>
        </div>

        <div className="backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 mb-2 text-red-300">
            <ShieldAlert size={18} />
            <span className="font-semibold uppercase text-xs tracking-wider">स्टॉप लॉस (Stop Loss)</span>
          </div>
          <p className="text-2xl font-mono text-white">{data.stopLoss}</p>
        </div>
      </div>

      {/* Option Strategy Section */}
      {data.optionStrategy && (
        <div className={`backdrop-blur-xl ${optionColor} border p-6 rounded-xl mb-6 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Zap size={100} />
          </div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="text-yellow-400" />
            ऑप्शन ट्रेडिंग सल्ला (Option Strategy)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <div className="mb-4">
                  <span className="text-gray-300 text-sm font-semibold uppercase">शिफारस (Recommendation)</span>
                  <div className="text-3xl font-extrabold text-white mt-1">
                    {data.optionStrategy.action} <span className="text-yellow-400">{data.optionStrategy.strikePrice}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-gray-300 text-xs">एक्सपायरी (Expiry)</span>
                    <p className="font-mono text-white">{data.optionStrategy.expiry}</p>
                  </div>
                  <div>
                     <span className="text-gray-300 text-xs">नफा क्षमता (ROI Potential)</span>
                     <p className="font-mono text-green-300">{data.optionStrategy.roiPotential}</p>
                  </div>
                </div>
             </div>
             
             <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                <div className="flex items-center gap-2 mb-2 text-gray-300">
                   <DollarSign size={16} />
                   <span className="text-xs font-bold uppercase">OI & Logic (ओपन इंटरेस्ट तर्क)</span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                  {data.optionStrategy.reasoning}
                </p>
             </div>
          </div>
        </div>
      )}

      {/* Timeframe Analysis */}
      <div className="backdrop-blur-xl bg-black/40 border border-white/10 p-6 rounded-xl mb-6">
         <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="text-blue-400" />
          वेळानुसार विश्लेषण (Timeframe Analysis)
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
          {data.timeframeAnalysis && data.timeframeAnalysis.map((tf, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-white text-sm bg-white/10 px-2 py-0.5 rounded">{tf.timeframe}</span>
                <span className={`text-xs font-semibold ${tf.buyPercent >= tf.sellPercent ? 'text-green-400' : 'text-red-400'}`}>
                  {tf.buyPercent >= tf.sellPercent ? 'BUY (खरेदी)' : 'SELL (विक्री)'}
                </span>
              </div>
              
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000" 
                  style={{ width: `${tf.buyPercent}%` }}
                ></div>
                <div 
                  className="h-full bg-gradient-to-l from-red-600 to-red-400 transition-all duration-1000" 
                  style={{ width: `${tf.sellPercent}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-1 text-xs font-mono">
                <span className="text-green-400">Buy: {tf.buyPercent}%</span>
                <span className="text-red-400">Sell: {tf.sellPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Text */}
      <div className="backdrop-blur-xl bg-black/40 border border-white/10 p-6 rounded-xl mb-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="text-purple-400" />
          तांत्रिक विश्लेषण (Technical Analysis)
        </h3>
        <p className="text-gray-200 leading-relaxed whitespace-pre-line text-lg">
          {data.reasoning}
        </p>
      </div>

      {/* Key Levels */}
      <div className="backdrop-blur-xl bg-black/40 border border-white/10 p-6 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4">महत्वाचे स्तर (Key Levels)</h3>
        <div className="flex flex-wrap gap-2">
          {data.keyLevels.map((level, idx) => {
            // Logic to color code Support and Resistance
            const isSupport = level.toLowerCase().includes('support') || level.includes('सपोर्ट');
            const isResistance = level.toLowerCase().includes('resistance') || level.includes('रेझिस्टन्स');
            
            let badgeClass = "bg-white/10 text-blue-200 border-white/5";
            if (isSupport) badgeClass = "bg-green-500/20 text-green-300 border-green-500/30";
            if (isResistance) badgeClass = "bg-red-500/20 text-red-300 border-red-500/30";

            return (
              <span key={idx} className={`px-3 py-1 rounded-full text-sm font-mono border ${badgeClass}`}>
                {level}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;