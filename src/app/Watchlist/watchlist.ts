import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService, WatchlistStock } from '../Stocks_Uploading/stock-service';

@Component({ selector: 'app-watchlist', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './watchlist.html', styleUrl: './watchlist.css' })
export class WatchlistComponent implements OnInit {
  private readonly service = inject(StockService);
  stocks = signal<WatchlistStock[]>([]); ticker = ''; loading = signal(true); saving = signal(false); error = signal<string | null>(null);
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.service.getWatchlist().subscribe({ next: v => { this.stocks.set(v); this.loading.set(false); }, error: e => { this.error.set(e.message); this.loading.set(false); } }); }
  add(): void { const value = this.ticker.trim(); if (!value || this.saving()) return; this.saving.set(true); this.error.set(null); this.service.addWatchlistStock(value).subscribe({ next: stock => { this.stocks.update(items => [...items, stock]); this.ticker = ''; this.saving.set(false); }, error: e => { this.error.set(e.message); this.saving.set(false); } }); }
  remove(stock: WatchlistStock): void { if (!confirm(`Remove ${stock.ticker} from your watchlist?`)) return; this.service.deleteWatchlistStock(stock.id).subscribe({ next: () => this.stocks.update(items => items.filter(item => item.id !== stock.id)), error: e => this.error.set(e.message) }); }
}
