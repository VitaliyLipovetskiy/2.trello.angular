import {AfterViewInit, Directive, ElementRef, inject} from '@angular/core';

@Directive({
  selector: '[trAutofocus]',
})
export class AutofocusDirective implements AfterViewInit {
  elementRef = inject(ElementRef);

  ngAfterViewInit() {
    this.elementRef.nativeElement.focus();
  }
}
