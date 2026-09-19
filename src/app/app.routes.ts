import { Routes } from '@angular/router';
import { StockUploadComponent } from './Stocks_Uploading/stocks';
import { WatchlistComponent } from './Watchlist/watchlist';
import { HistoryComponent } from './History/history';
import { BotWidgetComponent } from './Bot_Widget/bot_widget';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: StockUploadComponent },
  { path: 'analyze', component: BotWidgetComponent },
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'history', component: HistoryComponent },
  { path: '**', redirectTo: 'dashboard' }
];
