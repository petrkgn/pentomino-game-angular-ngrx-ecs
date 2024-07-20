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
    canvas.style.cssText = `${this.canvasCss};`;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    const width = (canvas.width = this.window.innerWidth * devicePixelRatio);
    const height = (canvas.height = this.window.innerHeight * devicePixelRatio);
    const canvasCenter = {
      x: this.window.innerWidth * 0.5,
      y: this.window.innerHeight * 0.5,
    };
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
