export type AssetImg = {
  id: string;
  type: "img";
  img: HTMLImageElement;
  mirrorImg: HTMLCanvasElement | null;
};
