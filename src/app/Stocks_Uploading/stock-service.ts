import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from './environment';

export interface HistoricalData { ticker: string; date: string; open: number; high: number; low: number; close: number; volume: number; previousClose: number; movingAverage30: number; last7Days: number[]; marketStatus: string; asOf: string; }
export interface TechnicalAnalysis { trend: string; movingAverage30: number; support: number; resistance: number; change7d: string; volumeSignal: string; signals: string[]; }
export interface Prediction { low: number; high: number; confidence: number; sentiment: string; reasoning: string; }
export interface StockAiAgentInsights { sentiment: string; executiveSummary: string; bullCase: string[]; bearCase: string[]; keyRisks: string[]; valuationAssessment: string; agentModel: string; timestamp?: number; }
export interface MLPrediction { predictedPrice: number; confidenceScore: number; trend: string; detectedPattern: string; patternConfidence: number; patternRecommendation: string; modelRmse: number; }
export interface DebateResult { debateTriggered: boolean; disagreementScore: number; mlAdvocatePosition?: string; technicalAdvocatePosition?: string; finalSynthesis?: string; }
export interface TrendingStock { symbol: string; name: string; price: number; high52: number; low52: number; change3Mo: string; volume: string; sentiment: string; confidence: number; executiveSummary: string; bullCase: string[]; bearCase: string[]; keyRisk: string; catalyst: string; }
export interface AnalysisResult { ticker: string; confidence: number; historicalData: HistoricalData; analysis: TechnicalAnalysis; prediction: Prediction; mlPrediction?: MLPrediction; aiInsights?: StockAiAgentInsights; debateResult?: DebateResult; }
export interface WatchlistStock { id: number; userId: number; ticker: string; yahooSymbol: string; displayName: string; price?: number; high52?: number; low52?: number; marketStatus?: string; asOf?: string; errorMessage?: string; createdAt?: string; }
export interface AnalysisHistoryItem { id: number; userId: number; ticker: string; confidence: number; prediction?: Prediction; historicalData?: HistoricalData; technicalAnalysis?: TechnicalAnalysis; createdAt: string; }
export interface HistoryPage { content: AnalysisHistoryItem[]; number: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean; }

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly http = inject(HttpClient); private readonly apiUrl = environment.apiUrl;
  getTrendingStocks(): Observable<TrendingStock[]> { return this.http.get<TrendingStock[]>(`${this.apiUrl}/trending`).pipe(catchError(this.handleError)); }
  getWatchlist(userId = 1): Observable<WatchlistStock[]> { return this.http.get<WatchlistStock[]>(`${this.apiUrl}/watchlist`, { params: { userId } }).pipe(catchError(this.handleError)); }
  addWatchlistStock(ticker: string, userId = 1): Observable<WatchlistStock> { return this.http.post<WatchlistStock>(`${this.apiUrl}/watchlist`, { ticker }, { params: { userId } }).pipe(catchError(this.handleError)); }
  deleteWatchlistStock(id: number, userId = 1): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/watchlist/${id}`, { params: { userId } }).pipe(catchError(this.handleError)); }
  getAnalysisHistory(page = 0, size = 20, ticker?: string, userId = 1): Observable<HistoryPage> { let params: Record<string, string | number> = { userId, page, size }; if (ticker?.trim()) params = { ...params, ticker: ticker.trim() }; return this.http.get<HistoryPage>(`${this.apiUrl}/history`, { params }).pipe(catchError(this.handleError)); }
  getAnalysisHistoryItem(id: number, userId = 1): Observable<AnalysisHistoryItem> { return this.http.get<AnalysisHistoryItem>(`${this.apiUrl}/history/${id}`, { params: { userId } }).pipe(catchError(this.handleError)); }
  getPastAnalyses(size = 50, userId = 1): Observable<AnalysisHistoryItem[]> { return this.getAnalysisHistory(0, size, undefined, userId).pipe(map(page => page.content)); }
  searchStockByTrend(ticker: string): Observable<TrendingStock> { return this.getTrendingStocks().pipe(map(items => { const match = items.find(item => item.symbol.toUpperCase() === ticker.trim().toUpperCase()); if (!match) throw new Error(`No data found for ${ticker}`); return match; })); }
  analyzeChart(file: File, userId = 1): Observable<AnalysisResult> { const formData = new FormData(); formData.append('chartImage', file); formData.append('userId', userId.toString()); return this.http.post<AnalysisResult>(`${this.apiUrl}/analyze`, formData).pipe(catchError(this.handleError)); }
  private handleError(error: HttpErrorResponse): Observable<never> { const message = error.error?.message || error.error?.error || `Request failed (${error.status})`; return throwError(() => new Error(message)); }
}
