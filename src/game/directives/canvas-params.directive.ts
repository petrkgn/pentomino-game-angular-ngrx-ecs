import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    Renderer2,
    inject,
    viewChild,
  } from '@angular/core';
  import { WINDOW } from '@ng-web-apis/common';
import { CanvasParams } from '../interfaces/canvas-params';
import { ResizeService } from '../services/resize.service';
import { tap } from 'rxjs';
  
  @Directive({
    selector: '[canvasParams]',
    standalone: true,
  })
  export class CanvasParamsDirective implements AfterViewInit {
    @Input('selector') selector: string = '';

    private readonly window = inject(WINDOW)
    private readonly resizeService = inject(ResizeService);
    private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>(this.selector);

    @Output() canvasParams = new EventEmitter<CanvasParams>()
  
    ngAfterViewInit() {
        this.initCanvasParams();  
        this.listenToResize()   
    }

    private listenToResize(): void {
        this.resizeService
          .calculateScaleRatio(32, 20)
          .pipe(
              tap(() => {          
                this.initCanvasParams()
          })
        )
        .subscribe();
    }

    private initCanvasParams(): void {
        const canvasParams = {
            layer: this.canvas().nativeElement,
            ctx: this.canvas().nativeElement.getContext('2d'),
            canvasPositionTop: 0,
            cnvasPositionLeft: 0,
            width: this.window.innerWidth,
            height: this.window.innerWidth,
           
        }
        this.canvasParams.emit(canvasParams)
    }
  }


 
