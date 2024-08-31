import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class FireEffectService {
  private worker: Worker | null = null;

  private vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  private fragmentShaderSource = "";

  async loadFragmentShader(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      this.fragmentShaderSource = await response.text();
    } catch (error) {
      throw new Error("Failed to load shader source:" + error);
    }
  }

  initWebGL(
    canvasId: string,
    offscreenCanvas: OffscreenCanvas,
    coordinates: { x: number; y: number }
  ): void {
    if (!this.worker) {
      this.worker = new Worker(
        new URL("../workers/fire-effect.worker.js", import.meta.url)
      );
    }

    // Инициализация WebGL контекста для конкретного canvas
    this.worker.postMessage(
      {
        type: "init",
        canvasId,
        canvas: offscreenCanvas,
        vertexShaderSource: this.vertexShaderSource,
        fragmentShaderSource: this.fragmentShaderSource,
        width: offscreenCanvas.width,
        height: offscreenCanvas.height,
        coordinates,
      },
      [offscreenCanvas]
    );
  }

  updateWebGLSize(
    canvasId: string,
    width: number,
    height: number,
    coordinates: { x: number; y: number }
  ): void {
    if (this.worker) {
      // Отправка обновленных размеров для конкретного canvas
      this.worker.postMessage({
        type: "update",
        canvasId,
        width,
        height,
        coordinates,
      });
    }
  }
}
