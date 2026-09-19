import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService, HistoryPage } from '../Stocks_Uploading/stock-service';

@Component({ selector: 'app-history', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './history.html', styleUrl: './history.css' })
export class HistoryComponent implements OnInit {
  private readonly service = inject(StockService); data = signal<HistoryPage | null>(null); ticker = ''; page = 0; loading = signal(true); error = signal<string | null>(null);
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.service.getAnalysisHistory(this.page, 10, this.ticker).subscribe({ next: v => { this.data.set(v); this.loading.set(false); }, error: e => { this.error.set(e.message); this.loading.set(false); } }); }
  search(): void { this.page = 0; this.load(); }
  previous(): void { if (this.data()?.first) return; this.page--; this.load(); }
  next(): void { if (this.data()?.last) return; this.page++; this.load(); }
}
