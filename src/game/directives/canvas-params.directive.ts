import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  inject,
} from "@angular/core";
import { WINDOW } from "@ng-web-apis/common";

import { CanvasParams } from "../interfaces/canvas-params";
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

  get canvas() {
    return this.elRef.nativeElement;
  }

  @Output() canvasParams = new EventEmitter<CanvasParams>();

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
    this.canvas.style.cssText = `${this.canvasCss};`;
    const ctx = this.canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    const width = (this.canvas.width = this.window.innerWidth);
    const height = (this.canvas.height = this.window.innerHeight);
    const canvasCenter = {
      x: this.window.innerWidth * 0.5,
      y: this.window.innerHeight * 0.5,
    };
    const canvasParams: CanvasParams = {
      ctx,
      canvasCenter,
      width,
      height,
      canvasEl: this.canvas,
    };
    this.canvasParams.emit(canvasParams);
  }
}
