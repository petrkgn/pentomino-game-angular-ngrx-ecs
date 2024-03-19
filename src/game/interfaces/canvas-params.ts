export interface CanvasParams {
    layer: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D | null;
    canvasPositionTop: number,
    cnvasPositionLeft: number,
    width: number,
    height: number
}