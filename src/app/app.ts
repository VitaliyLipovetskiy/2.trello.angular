import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmModal, ProgressBar } from '@app/shared/components';

@Component({
  selector: 'tr-root',
  imports: [RouterOutlet, ProgressBar, ConfirmModal],
  templateUrl: './app.html',
})
export class App {}
