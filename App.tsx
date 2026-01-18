
import React, { useState } from 'react';
import { analyzeNewsAuthenticity } from './services/geminiService';
import { NewsStatus, AnalysisResult } from './types';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<NewsStatus>(NewsStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!inputText.trim()) return;

    setStatus(NewsStatus.LOADING);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeNewsAuthenticity(inputText);
      setResult(analysis);
      setStatus(NewsStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Failed to process news authentication. Please check your network and try again.");
      setStatus(NewsStatus.ERROR);
    }
  };

  const handleReset = () => {
    setInputText('');
    setResult(null);
    setStatus(NewsStatus.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] flex flex-col items-center py-12 px-4 selection:bg-blue-500 selection:text-white">
      {/* Header Section (Based on Screenshot) */}
      <div className="max-w-3xl w-full text-left">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1 overflow-hidden shadow-lg">
             <i className="fa-solid fa-newspaper text-gray-800 text-2xl"></i>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">TruthScan</h1>
        </div>

        <h2 className="text-2xl font-semibold text-gray-100 mb-4">AI Fake News Detection System</h2>
        
        <p className="text-gray-400 mb-6 leading-relaxed">
          Enter a news headline or article to check whether it is Fake or Real using an AI-based text classification model.
        </p>

        <div className="p-4 bg-gray-800/20 border-l-4 border-blue-600 mb-8 rounded-r">
            <p className="text-gray-400 text-sm">
                This system utilizes the <span className="text-blue-400 font-medium">BERT (Bidirectional Encoder Representations from Transformers)</span> algorithm for natural language processing and text classification.
            </p>
        </div>

        {/* Form Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-300">📝</span>
            <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Enter News Text</label>
          </div>
          
          <div className="relative group">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste a news headline or article here..."
              className="w-full h-48 bg-[#1a1e26] border border-gray-700 rounded-lg p-5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none shadow-inner"
            />
            {inputText && (
              <button 
                onClick={() => setInputText('')}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={handleCheck}
              disabled={status === NewsStatus.LOADING || !inputText.trim()}
              className={`flex items-center gap-2 px-8 py-3 bg-[#232a35] text-white font-semibold rounded-lg border border-gray-700 hover:bg-[#2d3542] hover:border-gray-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none group`}
            >
              {status === NewsStatus.LOADING ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <i className="fa-solid fa-magnifying-glass group-hover:scale-110 transition-transform"></i>
              )}
              {status === NewsStatus.LOADING ? 'Analyzing Architecture...' : 'Check Authenticity'}
            </button>

            {result && (
              <button
                onClick={handleReset}
                className="text-gray-500 hover:text-white text-sm font-medium transition-colors"
              >
                Clear Results
              </button>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Results Visualization */}
        {result && <ResultDisplay result={result} />}

        {/* Loading Skeleton */}
        {status === NewsStatus.LOADING && (
          <div className="mt-8 p-6 bg-[#161a20] rounded-xl border border-gray-800 animate-pulse">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-48 h-48 bg-gray-800 rounded-full"></div>
              <div className="flex-1 space-y-4 w-full">
                <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Decoration */}
      <footer className="mt-auto pt-12 text-gray-600 text-xs flex flex-col items-center gap-2">
        <div className="flex gap-4">
          <span>BERT v2.4.0 Engine</span>
          <span>•</span>
          <span>Neural Net Classification</span>
          <span>•</span>
          <span>NLP Analysis</span>
        </div>
        <p className="opacity-50">&copy; 2025 TruthScan Intelligence. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
