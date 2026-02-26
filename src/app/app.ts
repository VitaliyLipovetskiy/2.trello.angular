import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressBar } from '@app/shared/components';

@Component({
  selector: 'tr-root',
  imports: [RouterOutlet, ProgressBar],
  templateUrl: './app.html',
})
export class App {}
