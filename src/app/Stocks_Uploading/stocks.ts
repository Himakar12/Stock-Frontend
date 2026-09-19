  import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { StockService, TrendingStock } from './stock-service';
  import { Subject, takeUntil } from 'rxjs';

  interface TabItem {
    id: string;
    label: string;
  }

   @Component({
    selector: 'app-stock-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stocks.html',
    styleUrls: ['./stocks.css']
  })
  export class StockUploadComponent implements OnInit, OnDestroy {
    private stockService = inject(StockService);
    private destroy = new Subject<void>();

    trendingStocks = signal<TrendingStock[]>([]);
    expandedStock = signal<string | null>(null);
    isTrendingLoading = signal<boolean>(true);

    currentIndex = signal(0);
    animateClass = signal('animate__animated animate__faster animate__fadeIn');

    // Tab state
    tabs: TabItem[] = [
      { id: 'five-stocks', label: '🔥 Five Stocks' },
      { id: 'past-analysis', label: '📊 Past Analysis' }
    ];
    activeTab = signal<string>('five-stocks');

    // Dynamic trend search
    trendSearchQuery = signal<string>('');
    searchedStock = signal<TrendingStock | null>(null);
    isSearchLoading = signal<boolean>(false);
    searchError = signal<string | null>(null);

    // Past analysis records
    pastAnalyses = signal<any[]>([]);
    isPastAnalysisLoading = signal<boolean>(false);

    currentStock = computed(() => {
      const stocks = this.trendingStocks();
      if (!stocks.length) return null;
      const i = ((this.currentIndex() % stocks.length) + stocks.length) % stocks.length;
      return stocks[i];
    });

    ngOnInit(): void {
      this.loadTrendingStocks();
    }

    loadTrendingStocks(): void {
      this.isTrendingLoading.set(true);
      this.stockService.getTrendingStocks()
        .pipe(takeUntil(this.destroy))
        .subscribe({
          next: (stocks) => {
            this.trendingStocks.set(stocks);
            this.isTrendingLoading.set(false);
          },
          error: (err) => {
            console.warn('Backend trending endpoint not reached, using built-in radar data:', err);
            this.trendingStocks.set(this.getFallbackTrendingStocks());
            this.isTrendingLoading.set(false);
          }
        });
    }

    toggleExpand(symbol: string): void {
      this.expandedStock.update(curr => curr === symbol ? null : symbol);
    }

    nextStock(): void {
      if (!this.trendingStocks().length) return;
      this.expandedStock.set(null);
      this.playAnim('animate__fadeInRight');
      this.currentIndex.update(i => i + 1);
    }

    prevStock(): void {
      if (!this.trendingStocks().length) return;
      this.expandedStock.set(null);
      this.playAnim('animate__fadeInLeft');
      this.currentIndex.update(i => i - 1);
    }

    goToStock(i: number): void {
      this.expandedStock.set(null);
      this.playAnim('animate__fadeIn');
      this.currentIndex.set(i);
    }

    // Tab switching
    switchTab(tabId: string): void {
      this.activeTab.set(tabId);
      if (tabId === 'past-analysis') {
        this.loadPastAnalysis();
      }
      // Reset any expanded stock when switching tabs
      this.expandedStock.set(null);
      this.searchedStock.set(null);
    }

    // Dynamic trend search
    onTrendSearch(): void {
      const query = this.trendSearchQuery().trim();
      if (!query) return;

      this.isSearchLoading.set(true);
      this.searchError.set(null);

      this.stockService.searchStockByTrend(query)
        .pipe(takeUntil(this.destroy))
        .subscribe({
          next: (stock) => {
            this.searchedStock.set(stock);
            this.isSearchLoading.set(false);
          },
          error: (err) => {
            console.warn('Backend trend endpoint not reached, using fallback:', err);
            const fallback = this.getFallbackStock(query.toUpperCase());
            if (fallback) {
              this.searchedStock.set(fallback);
            } else {
              this.searchError.set(`No data found for trend "{query}"`);
            }
            this.isSearchLoading.set(false);
          }
        });
    }

    onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Enter') {
        this.onTrendSearch();
      }
    }

    // Past analysis (50 records limit)
    loadPastAnalysis(): void {
      this.isPastAnalysisLoading.set(true);
      this.stockService.getPastAnalyses(50)
        .pipe(takeUntil(this.destroy))
        .subscribe({
          next: (analyses) => {
            this.pastAnalyses.set(analyses);
            this.isPastAnalysisLoading.set(false);
          },
          error: (err) => {
            console.warn('Backend analysis history not reached, using fallback:', err);
            this.pastAnalyses.set(this.getFallbackPastAnalyses());
            this.isPastAnalysisLoading.set(false);
          }
        });
    }

    // Fallback data
    private getTrendingStocksFallback(): TrendingStock[] {
      return [
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          price: 218.63,
          high52: 423.5,
          low52: 221.48,
          change3Mo: '+22.8%',
          volume: '86.8M',
          sentiment: 'BULLISH',
          confidence: 88,
          catalyst: 'Blackwell / Rubin AI compute supercycle & Hyperscaler Capex',
          executiveSummary: 'NVIDIA is the undisputed compute backbone of AI data centers.',
          bullCase: [
            'Dominant 85%+ market share in AI training and inference accelerators',
            'Gross margins sustained above 72% backed by CUDA software moat'
          ],
          bearCase: [
            'Big Tech custom silicon (TPU, Trainium, MTIA) eroding share',
            'Export control restrictions limiting advanced-chip access to China'
          ],
          keyRisk: 'Any slowdown or moderation in Big Tech AI infrastructure capital expenditure.'
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          price: 495.63,
          high52: 553.72,
          low52: 349.2,
          change3Mo: '+14.1%',
          volume: '22.8M',
          sentiment: 'STRONG_BUY',
          confidence: 89,
          catalyst: 'Azure AI cloud workloads & enterprise Copilot seat monetization',
          executiveSummary: 'Microsoft maintains the premier diversified software balance sheet in technology.',
          bullCase: [
            'Azure taking market share in cloud migration driven by enterprise AI deployments',
            'Pervasive integration of Copilot into Office 365, Teams, and Windows'
          ],
          bearCase: [
            'Accelerated capital expenditure and energy grid buildout weighing on margins',
            'Enterprise seat ramp-up pacing slower than initial projections'
          ],
          keyRisk: 'Short-term cloud gross margin compression due to data center depreciation.'
        },
        {
          symbol: 'TSLA',
          name: 'Tesla, Inc.',
          price: 365.44,
          high52: 498.83,
          low52: 297.38,
          change3Mo: '+22.9%',
          volume: '61.5M',
          sentiment: 'NEUTRAL',
          confidence: 71,
          catalyst: 'Unsupervised Cybercab / Robotaxi commercial rollout & Megapack growth',
          executiveSummary: 'Tesla is pivoting market perception from an EV automaker to an autonomous robotics and AI ecosystem.',
          bullCase: [
            'Regulatory tailwinds and rapid fleet data advantage for unsupervised FSD',
            'Energy storage division (Megapack) expanding with record operating margins'
          ],
          bearCase: [
            'Intense pricing competition and margin compression in core automotive sales',
            'Valuation requires multi-billion dollar autonomous rideshare monetization'
          ],
          keyRisk: 'Regulatory delays or safety reviews regarding unsupervised driverless operations.'
        },
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 332.27,
          high52: 344.57,
          low52: 229.02,
          change3Mo: '+18.4%',
          volume: '48.9M',
          sentiment: 'BULLISH',
          confidence: 84,
          catalyst: 'Apple Intelligence device replacement supercycle & Services expansion',
          executiveSummary: 'Apple remains the world\'s most valuable consumer hardware franchise.',
          bullCase: [
            'Privacy-focused Apple Intelligence features compelling iPhone upgrade cycle',
            'Services ecosystem (App Store, Cloud, Pay, Subscriptions) producing high recurring FCF'
          ],
          bearCase: [
            'Global antitrust regulatory scrutiny over default search and App Store fees',
            'Competitive smartphone dynamics in the greater China market'
          ],
          keyRisk: 'Rejection at key historical resistance near the 344.50 all-time high.'
        },
        {
          symbol: 'PLTR',
          name: 'Palantir Technologies',
          price: 167.23,
          high52: 207.52,
          low52: 106.37,
          change3Mo: '+57.2%',
          volume: '45.2M',
          sentiment: 'BULLISH',
          confidence: 82,
          catalyst: 'Enterprise AIP adoption & S&P 500 institutional accumulation',
          executiveSummary: 'Palantir AIP bootcamps are aggressively converting enterprise customers into long-term contracts.',
          bullCase: [
            'Explosive US commercial revenue growth exceeding 50% year-over-year',
            'Expanding defense and intelligence contracts cementing reliable cash flows'
          ],
          bearCase: [
            'Trading at elevated P/E and price-to-sales multiples compared to SaaS peers',
            'Stock-based compensation overhang and executive profit taking'
          ],
          keyRisk: 'Multiple compression if revenue growth fails to beat aggressive consensus targets.'
        }
      ];
    }

    private getFallbackTrendingStocks(): TrendingStock[] {
      return this.getTrendingStocksFallback();
    }

    private getFallbackStock(symbol: string): TrendingStock | null {
      const fallbacks = this.getTrendingStocksFallback();
      return fallbacks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase()) ?? null;
    }

    private getFallbackPastAnalyses(): any[] {
      const stocks = this.getTrendingStocksFallback();
      return stocks.map((stock, i) => ({
        ticker: stock.symbol,
        analysisDate: new Date(Date.now() - i * 86400000).toLocaleDateString(),
        trendName: stock.sentiment,
        prediction: stock.confidence >= 80 ? 'BULLISH' : 'NEUTRAL',
        confidence: stock.confidence,
        sentiment: stock.sentiment,
        keyRisk: stock.keyRisk
      }));
    }
  }
