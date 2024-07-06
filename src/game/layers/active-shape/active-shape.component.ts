import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  ViewChild,
} from "@angular/core";

import { WINDOW } from "@ng-web-apis/common";
import { Entity } from "../../types/entity";
import { ComponentType } from "../../constants/component-type.enum";
import { PickComponentType } from "../../types/components";
import { isDefined } from "../../utils/filter-defined";
import { ResizeService } from "../../services/resize.service";
import { tap } from "rxjs";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { ComponentView } from "../../constants/view.enum";

@Component({
  selector: "game-active-shape",
  standalone: true,
  template: `
    <canvas #myCanvas></canvas>
    <img #myImg class="assets" [src]="componentView.SHAPE_W" />
  `,
  styles: ``,
})
export class ActiveShapeComponent implements AfterViewInit {
  private readonly resizeService = inject(ResizeService);
  private readonly window = inject(WINDOW);
  private readonly gameFacade = inject(GameFacade);

  readonly componentView = ComponentView;

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

      const rotateComponent = shape.components.entities[
        ComponentType.ROTATE
      ] as PickComponentType<ComponentType.ROTATE>;

      const positionComponent = shape.components.entities[
        ComponentType.POSITION
      ] as PickComponentType<ComponentType.POSITION>;

      if (positionComponent && rotateComponent) {
        const angle = rotateComponent.angle;
        const x = positionComponent.x;
        const y = positionComponent.y;
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
