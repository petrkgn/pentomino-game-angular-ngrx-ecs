import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  Renderer2,
} from '@angular/core';
import { WINDOW } from '@ng-web-apis/common';

@Directive({
  selector: '[boundsElement]',
  standalone: true,
})
export class BonudsElementDirective implements AfterViewInit {
  @Input('selector') private readonly selector: string = '';
  @Input('color') private color: string = 'red';
  // private window = inject(WINDOW)

  el = this.element.nativeElement;

  constructor(private element: ElementRef, private renderer: Renderer2) {}
  ngAfterViewInit(): void {
    // console.log('!!!', this.el);
    this.getBoundsElement();
  }
  getBoundsElement(): void {
    if (this.el) {
      this.renderer.setStyle(this.el, 'background-color', this.color);
    }
  }
}
