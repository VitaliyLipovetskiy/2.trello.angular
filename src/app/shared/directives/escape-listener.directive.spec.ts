import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EscapeListenerDirective } from './escape-listener.directive';

@Component({
  template: `<div trCloseByEscape (escapeAction)="escaped = true"></div>`,
  imports: [EscapeListenerDirective],
})
class TestHostComponent {
  escaped = false;
}

describe('EscapeListenerDirective', () => {
  it('should emit escapeAction on Escape key', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).createComponent(TestHostComponent);

    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.escaped).toBe(true);
  });
});
