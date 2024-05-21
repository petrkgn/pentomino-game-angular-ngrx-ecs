import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
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
  @Input() canvasCss: string = "";
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
    this.canvas.style.cssText = `${this.canvasCss};`;
    const canvasParams: CanvasParams = {
      layer: this.canvas,
      ctx: this.canvas.getContext("2d"),
      canvasPositionTop: 0,
      canvasPositionLeft: 0,
      width: this.window.innerWidth,
      height: this.window.innerHeight,
      canvasEl: this.canvas,
    };
    this.canvasParams.emit(canvasParams);
  }

  // @HostListener("window:resize")
  // onResize() {
  //   this.initCanvasParams();
  // }
}
