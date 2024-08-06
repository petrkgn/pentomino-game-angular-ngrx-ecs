import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { WebGLService } from '../../services/webgl.service';

@Component({
  selector: 'game-effects',
  standalone: true,
  template: `<canvas
      #fire1
      style="width: 150px; height: 500px; top: 50px; left: 30px"
    ></canvas>
    <canvas
      #fire2
      style="width: 150px; height: 500px; top: 50px; left: 1225px"
    ></canvas>`,
})
export class EffectsComponent implements AfterViewInit {
  @ViewChild('fire1') private fire1!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fire2') private fire2!: ElementRef<HTMLCanvasElement>;

  private readonly webGLService = inject(WebGLService);

  ngAfterViewInit(): void {
    this.webGLService.loadFragmentShader('/assets/fire.frag').then(() => {
      console.log('Fragment shader loaded, initializing canvases');
      this.initCanvas(this.fire1.nativeElement);
      this.initCanvas(this.fire2.nativeElement);
    });
  }

  private initCanvas(canvas: HTMLCanvasElement): void {
    const offscreenCanvas = canvas.transferControlToOffscreen();
    offscreenCanvas.width = 150;
    offscreenCanvas.height = 500;
    this.webGLService.initWebGL(offscreenCanvas, { x: 65, y: 210 });
  }
}
