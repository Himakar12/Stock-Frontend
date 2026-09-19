import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BotWidgetComponent } from './Bot_Widget/bot_widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BotWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
