import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
  effect,
} from "@angular/core";
import { WINDOW } from "@ng-web-apis/common";
import { Entity } from "../../types/entity";
import { ComponentView } from "../../constants/view.enum";
import { ResizeService } from "../../services/resize.service";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { AssetsStore } from "../../store/assets/assets-srore";
import { tap } from "rxjs/internal/operators/tap";
import { RenderService } from "../../services/render.service";
import { RenderParams } from "../../types/render-params";
import { isDefined } from "../../utils";

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
  private readonly renderService = inject(RenderService);

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
      if (isDefined(this.activeShapes()) && this.ctx) {
        const params: RenderParams = {
          ctx: this.ctx,
          canvas: this.canvas,
          shapes: this.activeShapes() as Entity[],
          img: this.img.nativeElement,
          imgWidth: this.imgWidth,
          imgHeight: this.imgHeight,
        };
        this.renderService.render(params);
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
}
