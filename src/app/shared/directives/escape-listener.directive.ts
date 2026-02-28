import { Directive, HostListener, output } from '@angular/core';

@Directive({
  selector: '[trCloseByEscape]',
})
export class EscapeListenerDirective {
  readonly escapeAction = output<void>();

  @HostListener('document:keydown.escape', []) handleKeyEvent(): void {
    this.escapeAction.emit();
  }
}
