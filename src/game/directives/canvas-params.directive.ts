import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  inject,
} from "@angular/core";
import { WINDOW } from "@ng-web-apis/common";

import { CanvasParams } from "../interfaces/canvas-params";

@Directive({
  selector: "[canvasParams]",
  standalone: true,
})
export class CanvasParamsDirective implements AfterViewInit {
  private readonly window = inject(WINDOW);
  private readonly elRef = inject<ElementRef<HTMLCanvasElement>>(ElementRef);

  get canvas() {
    return this.elRef.nativeElement;
  }

  @Output() canvasParams = new EventEmitter<CanvasParams>();

  ngAfterViewInit() {
    this.initCanvasParams();
  }

  private initCanvasParams(): void {
    const canvasParams: CanvasParams = {
      layer: this.canvas,
      ctx: this.canvas.getContext("2d"),
      canvasPositionTop: 0,
      canvasPositionLeft: 0,
      width: this.window.innerWidth,
      height: this.window.innerHeight,
      canvasEl: this.elRef,
    };
    this.canvasParams.emit(canvasParams);
  }

  @HostListener("window:resize")
  onResize() {
    this.initCanvasParams();
  }
}
