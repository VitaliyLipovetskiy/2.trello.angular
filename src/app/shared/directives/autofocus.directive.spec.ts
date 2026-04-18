import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AutofocusDirective } from './autofocus.directive';

@Component({
  template: `<input trAutofocus />`,
  imports: [AutofocusDirective],
})
class TestHostComponent {}

describe('AutofocusDirective', () => {
  it('should focus the element after view init', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).createComponent(TestHostComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input');
    expect(document.activeElement).toBe(input);
  });
});
