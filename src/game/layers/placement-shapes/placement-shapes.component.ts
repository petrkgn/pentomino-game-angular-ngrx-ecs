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
} from '@angular/core';

import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';

import { WINDOW } from '@ng-web-apis/common';
import { Entity } from '../../interfaces/entity';
import { ComponentType } from '../../constants/component-type.enum';
import { PickComponentType } from '../../interfaces/components';
import { isDefined } from '../../utils/filter-defined';
import { ResizeService } from '../../services/resize.service';
import { tap } from 'rxjs';

@Component({
  selector: 'game-placement-shapes',
  imports: [JsonPipe, NgIf, AsyncPipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style='position:absolute; background-color: darkblue; opacity: 0.8; color: white; width: 200px; top: 300px'>
      <!-- <pre>{{activeShapes() | json}}</pre> -->
    </div>
    <div class="canvas-container">
    <canvas #myCanvas></canvas>
    <div>
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
    .canvas-container {
      position: absolute;
      height: 100%;
      width: 100%;
      /* opacity: 1; */
      /* margin: 0; */
      display: flex;
      justify-content: center;
      align-items: center;
      /* background-color: red; */
    }
`,
})
export class PlacementShapesComponent implements AfterViewInit {
  private readonly resizeService = inject(ResizeService);
  placementShapes: InputSignal<Entity[] | null> = input.required();
  private imgWidth = 96;
  private imgHeight = 96;
  private readonly window = inject(WINDOW);
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D | null;

  @ViewChild('myCanvas', { static: true })
  private readonly _canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('myImg', { static: true })
  private readonly img!: ElementRef;

  constructor() {
    effect((): any => {
      if (isDefined(this.placementShapes()))
        this.render(this.placementShapes() as Entity[]);
    });
  }

  ngAfterViewInit() {
    this.initCanvas();
    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap((value) => {
          const ratio = Math.ceil(value);
          // console.log('ratio!!!', value);
          this.imgWidth = 96 * ratio;
          this.imgHeight = 96 * ratio;
          this.canvas.width = this.window.innerWidth;
          this.canvas.height = this.window.innerHeight;
          this.render(this.placementShapes() as Entity[]);
        })
      )
      .subscribe();
  }

  // private updatePosition(
  //   objA: {x: number, y: number},
  //   newCoordinatesA: {x: number, y: number},
  //   objB: {x: number, y: number}
  // ): {x: number, y: number} {
  //   // Вычисляем разницу в координатах для objA
  //   const deltaX = newCoordinatesA.x - objA.x;
  //   const deltaY = newCoordinatesA.y - objA.y;

  //   // Создаем новый объект для objB с обновленными координатами, сохраняя относительное положение
  //   const updatedObjB = { 
  //     x: objB.x + deltaX,
  //     y: objB.y + deltaY,
  //   };

  //   return updatedObjB;
  // }

  initCanvas(): void {
    this.canvas = this._canvas.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.window.innerWidth;
    this.canvas.height = this.window.innerHeight;
  }

  render(placementShapes: Entity[]): void {
    if (!placementShapes?.length && this.ctx) {
      this.ctx.clearRect(0, 0, this.window.innerWidth, this.window.innerHeight);
      return;
    }

    placementShapes.forEach((shape) => {
      if (!this.ctx || !this.img) return;

      const rotateComponent = shape.components.find(
        (component): component is PickComponentType<ComponentType.ROTATE> =>
          component.type === ComponentType.ROTATE
      );

      const positionComponent = shape.components.find(
        (component): component is PickComponentType<ComponentType.POSITION> =>
          component.type === ComponentType.POSITION
      );

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
        // this.ctx.beginPath();
        // this.ctx.translate(positionX, positionY);
        // this.ctx.rotate((Math.PI / 180) * angle);
        // this.ctx.translate(-positionX, -positionY);
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
