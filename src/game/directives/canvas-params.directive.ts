import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  Output,
  inject,
  output,
} from "@angular/core";
import { WINDOW } from "@ng-web-apis/common";

import { CanvasParams } from "../types/canvas-params";
import { ResizeService } from "../services/resize.service";
import { tap } from "rxjs";

@Directive({
  selector: "[canvasParams]",
  standalone: true,
})
export class CanvasParamsDirective implements AfterViewInit {
  @Input() canvasCss: string = "";
  private readonly window = inject(WINDOW);
  private readonly elRef = inject<ElementRef<HTMLCanvasElement>>(ElementRef);
  private readonly resizeService = inject(ResizeService);

  canvasParams = output<CanvasParams>();

  ngAfterViewInit() {
    this.initCanvasParams();

    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap(() => {
          this.initCanvasParams();
        })
      )
      .subscribe();
  }

  private initCanvasParams(): void {
    const canvas = this.elRef.nativeElement;

    canvas.style.cssText = `${this.canvasCss}; width: 100vw; height: 100vh;`;

    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();

    const width = (canvas.width =
      Math.round(devicePixelRatio * rect.right) -
      Math.round(devicePixelRatio * rect.left));
    const height = (canvas.height =
      Math.round(devicePixelRatio * rect.bottom) -
      Math.round(devicePixelRatio * rect.top));

    const canvasCenter = {
      x: this.window.innerWidth * 0.5,
      y: this.window.innerHeight * 0.5,
    };

    ctx.imageSmoothingEnabled = true;

    const canvasParams: CanvasParams = {
      ctx,
      canvasCenter,
      width,
      height,
      canvas,
    };
    this.canvasParams.emit(canvasParams);
  }
}
