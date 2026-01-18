
import React from 'react';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ResultDisplayProps {
  result: AnalysisResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const isFake = result.verdict === 'FAKE';
  const data = [
    { name: 'Confidence', value: result.confidence },
    { name: 'Uncertainty', value: 100 - result.confidence },
  ];
  const COLORS = [isFake ? '#ef4444' : '#22c55e', '#1f2937'];

  return (
    <div className="mt-8 p-6 bg-[#161a20] rounded-xl border border-gray-800 shadow-2xl animate-fade-in transition-all">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="h-48 w-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-3xl font-bold ${isFake ? 'text-red-500' : 'text-green-500'}`}>
                {result.confidence}%
              </span>
              <span className="text-xs text-gray-400 uppercase tracking-widest">Confidence</span>
            </div>
          </div>
          <div className={`mt-2 px-6 py-2 rounded-full font-bold text-sm tracking-wider uppercase ${isFake ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
            {result.verdict}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Analysis Summary</h3>
            <p className="text-lg leading-relaxed text-gray-200">{result.explanation}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Detected Markers</h4>
              <div className="flex flex-wrap gap-2">
                {result.linguisticMarkers.map((marker, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 border border-gray-700">
                    {marker}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Stylometric Insight</h4>
              <p className="text-sm text-gray-300 italic">"{result.sourceReliability}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
