import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class FireEffectService {
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
    canvas: OffscreenCanvas,
    coordinates: { x: number; y: number }
  ): void {
    const worker = new Worker(
      new URL("../workers/fire-effect.worker.js", import.meta.url)
    );
    worker.postMessage(
      {
        canvas,
        vertexShaderSource: this.vertexShaderSource,
        fragmentShaderSource: this.fragmentShaderSource,
        width: canvas.width,
        height: canvas.height,
        coordinates,
      },
      [canvas]
    );
  }
}
