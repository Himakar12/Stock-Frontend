import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { environment } from './environment';
import { Observable, throwError, catchError, map } from 'rxjs';

export interface HistoricalData {
  ticker: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousClose: number;
  movingAverage30: number;
  last7Days: number[];
  marketStatus: string; // REGULAR, PRE, POST, CLOSED
  asOf: string;
}

export interface TechnicalAnalysis {
  trend: string;
  movingAverage30: number;
  support: number;
  resistance: number;
  change7d: string;
  volumeSignal: string;
  signals: string[];
}

export interface Prediction {
  low: number;
  high: number;
  confidence: number;
  sentiment: string;
  reasoning: string;
}

export interface StockAiAgentInsights {
  sentiment: string;
  executiveSummary: string;
  bullCase: string[];
  bearCase: string[];
  keyRisks: string[];
  valuationAssessment: string;
  agentModel: string;
  timestamp?: number;
}

export interface MLPrediction {
  predictedPrice: number;
  confidenceScore: number;
  trend: string;
  detectedPattern: string;
  patternConfidence: number;
  patternRecommendation: string;
  modelRmse: number;
}

export interface DebateResult {
  debateTriggered: boolean;
  disagreementScore: number;
  mlAdvocatePosition?: string;
  technicalAdvocatePosition?: string;
  finalSynthesis?: string;
}

export interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  high52: number;
  low52: number;
  change3Mo: string;
  volume: string;
  sentiment: string;
  confidence: number;
  executiveSummary: string;
  bullCase: string[];
  bearCase: string[];
  keyRisk: string;
  catalyst: string;
}

export interface AnalysisResult {
  ticker: string;
  confidence: number;
  historicalData: HistoricalData;
  analysis: TechnicalAnalysis;
  prediction: Prediction;
  mlPrediction?: MLPrediction;
  aiInsights?: StockAiAgentInsights;
  debateResult?: DebateResult;
}

@Injectable({ providedIn: 'root' })
export class StockService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTrendingStocks(limit = 5): Observable<TrendingStock[]> {
    return this.http.get<TrendingStock[]>(`${this.apiUrl}/trending`, { params: { limit: limit.toString() } })
      .pipe(catchError(this.handleError));
  }

  getLatestRecords(limit = 50): Observable<HistoricalData[]> {
    return this.http.get<HistoricalData[]>(`${this.apiUrl}/records/latest`, { params: { limit: limit.toString() } })
      .pipe(catchError(this.handleError));
  }

  searchStockByTrend(trendName: string): Observable<TrendingStock> {
    return this.http.get<TrendingStock>(`${this.apiUrl}/trending/${encodeURIComponent(trendName)}`)
      .pipe(catchError(this.handleError));
  }

  getAnalysisHistory(limit = 50): Observable<AnalysisResult[]> {
    return this.http.get<AnalysisResult[]>(`${this.apiUrl}/analysis/history`, { params: { limit: limit.toString() } })
      .pipe(catchError(this.handleError));
  }

  analyzeChart(file: File, userId = 1): Observable<AnalysisResult> {
    const formData = new FormData();
    formData.append('chartImage', file);
    formData.append('userId', userId.toString());

    return this.http.post<AnalysisResult>(`${this.apiUrl}/analyze`, formData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      message = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      message = error.error?.message || `Server error: ${error.status} - ${error.statusText}`;
    }
    
    console.error('StockService error:', error);
    return throwError(() => new Error(message));
  }
}