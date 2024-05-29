import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  ViewChild,
} from "@angular/core";

import { AsyncPipe, JsonPipe, NgIf } from "@angular/common";

import { WINDOW } from "@ng-web-apis/common";
import { Entity } from "../../interfaces/entity";
import { ComponentType } from "../../constants/component-type.enum";
import { PickComponentType } from "../../interfaces/components";
import { isDefined } from "../../utils/filter-defined";
import { ResizeService } from "../../services/resize.service";
import { tap } from "rxjs";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
  selector: "game-active-shape",
  imports: [JsonPipe, NgIf, AsyncPipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- <div
      style="position:absolute; background-color: darkblue; opacity: 0.8; color: white; width: 200px; top: 100px"> -->
    <!-- <pre>{{ activeShapes() | json }}</pre> -->
    <!-- </div> -->
    <!-- <div style='position:absolute; background-color: red; opacity: 0.8; color: white; width: 100vw; top: 0px; height: 348.875px'>    
    </div> -->
    <canvas #myCanvas></canvas>
    <img
      #myImg
      src="https://github.com/petrkgn/katamino-game-angular/blob/main/wshape.png?raw=true"
    />
  `,
  styles: `
  img {
    position: absolute;
    top: -100%;
  }  
`,
})
export class ActiveShapeComponent implements AfterViewInit {
  private readonly resizeService = inject(ResizeService);
  private readonly window = inject(WINDOW);
  private readonly gameFacade = inject(GameFacade);

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D | null;
  private imgWidth = 96;
  private imgHeight = 96;

  @ViewChild("myCanvas", { static: true })
  private readonly _canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild("myImg", { static: true })
  private readonly img!: ElementRef;

  activeShapes = toSignal(this.gameFacade.selectActiveShape(), {
    initialValue: [],
  });

  constructor() {
    effect((): any => {
      if (isDefined(this.activeShapes()))
        this.render(this.activeShapes() as Entity[]);
    });
  }

  ngAfterViewInit() {
    this.initCanvas();
    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap((value) => {
          const ratio = Math.ceil(value);
          // console.log('ratio', ratio);
          this.imgWidth = 96 * ratio;
          this.imgHeight = 96 * ratio;
          this.canvas.width = this.window.innerWidth;
          this.canvas.height = this.window.innerHeight;
        })
      )
      .subscribe();
  }

  initCanvas(): void {
    this.canvas = this._canvas.nativeElement;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.window.innerWidth;
    this.canvas.height = this.window.innerHeight;
  }

  render(activeShapes: Entity[]): void {
    if (!activeShapes.length && this.ctx) {
      this.ctx.clearRect(0, 0, this.window.innerWidth, this.window.innerHeight);
      return;
    }

    activeShapes.forEach((shape) => {
      if (!this.ctx || !this.img) return;

      const rotateComponent = shape.components.find(
        (component): component is PickComponentType<ComponentType.ROTATE> =>
          component.type === ComponentType.ROTATE
      );

      const mouseComponent = shape.components.find(
        (component): component is PickComponentType<ComponentType.MOUSE> =>
          component.type === ComponentType.MOUSE
      );

      if (mouseComponent && rotateComponent) {
        const angle = rotateComponent.angle;
        const x = mouseComponent.mx;
        const y = mouseComponent.my;
        const shape = this.img.nativeElement;
        const positionX = x - this.canvas.getBoundingClientRect().left;
        const positionY = y - this.canvas.getBoundingClientRect().top;

        this.ctx.clearRect(
          0,
          0,
          this.window.innerWidth,
          this.window.innerHeight
        );
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.translate(positionX, positionY);
        this.ctx.rotate((Math.PI / 180) * angle);
        this.ctx.translate(-positionX, -positionY);
        this.ctx.drawImage(
          shape,
          positionX - this.imgWidth / 2,
          positionY - this.imgHeight / 2,
          this.imgWidth,
          this.imgHeight
        );
        this.ctx.fill();
        this.ctx.restore();
      }
    });
  }
}
