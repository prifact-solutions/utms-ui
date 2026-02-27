import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  NgZone,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective {
  constructor(
    private _elementRef: ElementRef,
    private zone: NgZone,
  ) {}

  @Output()
  public clickOutside = new EventEmitter<MouseEvent>();

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }

    const clickedInside =
      this._elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.zone.run(() => {
        this.clickOutside.emit(event);
      });
    }
  }
}
