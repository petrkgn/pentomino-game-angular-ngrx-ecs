export interface CanvasParams {
    layer: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D | null;
    canvasPositionTop: number,
    canvasPositionLeft: number,
    width: number,
    height: number
}