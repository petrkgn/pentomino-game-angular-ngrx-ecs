import {
  AfterViewInit,
  Component,
  computed,
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

import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { ComponentView } from "../../constants/view.enum";
import { AssetsStore } from "../../store/assets/assets-srore";
import { tap } from "rxjs/internal/operators/tap";

@Component({
  selector: "game-active-shape",
  standalone: true,
  template: `
    <canvas #myCanvas style="background-color: green; opacity: 0.5"></canvas>
    <img #myImg class="assets" [src]="componentView.SHAPE_W" />
  `,
  styles: ``,
})
export class ActiveShapeComponent implements AfterViewInit {
  private readonly resizeService = inject(ResizeService);
  private readonly window = inject(WINDOW);
  private readonly gameFacade = inject(GameFacade);
  private readonly assetsStore = inject(AssetsStore);

  readonly componentView = ComponentView;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D | null;
  private imgWidth = 96;
  private imgHeight = 96;

  @ViewChild("myCanvas", { static: true })
  private readonly _canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild("myImg", { static: true })
  private readonly img!: ElementRef;

  // img = computed(() => this.assetsStore.entityMap()["wshape"]);

  activeShapes = toSignal(this.gameFacade.selectActiveShape(), {
    initialValue: [],
  });

  constructor() {
    effect((): any => {
      if (isDefined(this.activeShapes())) {
        this.render(this.activeShapes() as Entity[]);
      }
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
    // Ensure we have a valid rendering context
    if (!this.ctx) {
      return;
    }

    if (!activeShapes.length) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    activeShapes.forEach((shape) => {
      if (!this.ctx || !this.img) {
        return;
      }
      const rotateComponent = shape.components.entities[
        ComponentType.ROTATE
      ] as PickComponentType<ComponentType.ROTATE>;

      const positionComponent = shape.components.entities[
        ComponentType.POSITION
      ] as PickComponentType<ComponentType.POSITION>;

      const isMirror = shape.components.entities[
        ComponentType.IS_MIRROR_TAG
      ] as PickComponentType<ComponentType.IS_MIRROR_TAG>;

      if (positionComponent && rotateComponent) {
        let angle = rotateComponent.angle;
        const x = positionComponent.x;
        const y = positionComponent.y;
        const shapeImage = this.img.nativeElement;

        const positionX = x - this.canvas.getBoundingClientRect().left;
        const positionY = y - this.canvas.getBoundingClientRect().top;

        if (angle === 90 || angle === 270) {
          this.canvas.width = this.window.innerHeight * 2;
          this.canvas.height = this.window.innerWidth / 2;
        } else {
          this.canvas.width = this.window.innerWidth;
          this.canvas.height = this.window.innerHeight;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(positionX, positionY);

        this.ctx.rotate((angle * Math.PI) / 180);

        if (isMirror) {
          if (angle === 0 || angle === 180) {
            this.ctx.scale(-1, 1);
          } else {
            this.ctx.scale(1, -1);
          }
        }

        if (angle === 90 || angle === 270) {
          this.ctx.drawImage(
            shapeImage,
            -this.imgHeight / 2,
            -this.imgWidth / 2,
            this.imgHeight,
            this.imgWidth
          );
        } else {
          this.ctx.drawImage(
            shapeImage,
            -this.imgWidth / 2,
            -this.imgHeight / 2,
            this.imgWidth,
            this.imgHeight
          );
        }

        this.ctx.restore();
      }
    });
  }
}
