
export enum NewsStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface NewsSource {
  title: string;
  url: string;
}

export interface AnalysisResult {
  verdict: 'REAL' | 'FAKE';
  confidence: number;
  explanation: string;
  sourceReliability: string;
  linguisticMarkers: string[];
  sources?: NewsSource[];
}
