import { Component, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockService, AnalysisResult } from '../Stocks_Uploading/stock-service';
import { environment } from '../Stocks_Uploading/environment';
import { Subject, takeUntil } from 'rxjs';

type BotState = 'closed' | 'idle' | 'preview' | 'analyzing' | 'result' | 'error';

@Component({
  selector: 'app-bot-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bot_widget.html',
  styleUrls: ['./bot_widget.css']
})
export class BotWidgetComponent implements OnDestroy {
  private stockService = inject(StockService);
  private destroy$ = new Subject<void>();

  isOpen = signal(false);
  state = signal<BotState>('idle');
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  result = signal<AnalysisResult | null>(null);
  errorMessage = signal<string | null>(null);

  isLoading = computed(() => this.state() === 'analyzing');
  canAnalyze = computed(() => this.selectedFile() !== null && !this.isLoading());

  toggleOpen(): void {
    this.isOpen.update(v => !v);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const validationError = this.validateFile(file);
    if (validationError) {
      this.errorMessage.set(validationError);
      this.state.set('error');
      return;
    }

    this.selectedFile.set(file);
    this.errorMessage.set(null);
    this.result.set(null);

    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.state.set('preview');
  }

  private validateFile(file: File): string | null {
    if (!environment.allowedFileTypes.includes(file.type)) {
      return 'Please upload a PNG or JPEG image.';
    }
    if (file.size > environment.maxFileSizeMB * 1024 * 1024) {
      return `File size must be less than ${environment.maxFileSizeMB}MB.`;
    }
    return null;
  }

  analyze(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.state.set('analyzing');
    this.errorMessage.set(null);

    this.stockService.analyzeChart(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.result.set(response);
          this.state.set('result');
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message);
          this.state.set('error');
        }
      });
  }

  reset(): void {
    this.state.set('idle');
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.result.set(null);
    this.errorMessage.set(null);
  }

  getSentimentClass(sentiment: string): string {
    const map: Record<string, string> = {
      'STRONG_BUY': 'strong-bullish',
      'BULLISH': 'bullish',
      'BUY': 'bullish',
      'HOLD': 'neutral',
      'NEUTRAL': 'neutral',
      'SELL': 'bearish',
      'BEARISH': 'bearish',
      'STRONG_SELL': 'strong-bearish'
    };
    return map[sentiment] || 'neutral';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}