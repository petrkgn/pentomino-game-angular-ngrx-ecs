import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  output,
  input,
} from "@angular/core";
import { Observable, tap } from "rxjs";

import { CanvasParams } from "../types/canvas-params";
import { ResizeService } from "../services/resize.service";

@Directive({
  selector: "[canvasParams]",
  standalone: true,
})
export class CanvasParamsDirective implements AfterViewInit {
  private readonly elRef = inject<ElementRef<HTMLCanvasElement>>(ElementRef);
  private readonly resizeService = inject(ResizeService);

  canvasCss = input<string>("");
  canvasParams = output<CanvasParams>();

  ngAfterViewInit() {
    this.initializeCanvasParams();
    this.handleResize().subscribe();
  }

  private handleResize(): Observable<number> {
    return this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(tap(() => this.initializeCanvasParams()));
  }

  private initializeCanvasParams(): void {
    const canvas = this.elRef.nativeElement;
    this.applyCanvasStyles(canvas);
    const ctx = this.getCanvasContext(canvas);
    const { width, height } = this.setCanvasDimensions(canvas);
    const canvasCenter = this.calculateCanvasCenter(width, height);

    const canvasParams: CanvasParams = {
      ctx,
      canvasCenter,
      width,
      height,
      canvas,
    };

    this.canvasParams.emit(canvasParams);
  }

  private applyCanvasStyles(canvas: HTMLCanvasElement): void {
    canvas.style.cssText = `${this.canvasCss()}; width: 100vw; height: 100vh;`;
  }

  private getCanvasContext(
    canvas: HTMLCanvasElement
  ): CanvasRenderingContext2D {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2D context not supported or canvas already initialized");
    }
    ctx.imageSmoothingEnabled = true;
    return ctx;
  }

  private setCanvasDimensions(canvas: HTMLCanvasElement): {
    width: number;
    height: number;
  } {
    const rect = canvas.getBoundingClientRect();
    const width = (canvas.width =
      Math.round(devicePixelRatio * rect.right) -
      Math.round(devicePixelRatio * rect.left));
    const height = (canvas.height =
      Math.round(devicePixelRatio * rect.bottom) -
      Math.round(devicePixelRatio * rect.top));
    return { width, height };
  }

  private calculateCanvasCenter(
    width: number,
    height: number
  ): { x: number; y: number } {
    return {
      x: width * 0.5,
      y: height * 0.5,
    };
  }
}
