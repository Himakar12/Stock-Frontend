import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StockUploadComponent } from './Stocks_Uploading/stocks';
import { BotWidgetComponent } from './Bot_Widget/bot_widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StockUploadComponent, BotWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('stock-analysis');
}