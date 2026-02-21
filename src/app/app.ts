import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressBar } from '@app/common/components';

@Component({
  selector: 'tr-root',
  imports: [RouterOutlet, ProgressBar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
