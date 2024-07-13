import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class WebGLService {
  vertexShaderSource: string = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  fragmentShaderSource: string = "";

  private contexts: Map<
    HTMLCanvasElement,
    {
      gl: WebGL2RenderingContext;
      program: WebGLProgram;
      mouseLocation: WebGLUniformLocation;
      resolutionLocation: WebGLUniformLocation;
      timeLocation: WebGLUniformLocation;
    }
  > = new Map();

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

  initWebGL(canvas: HTMLCanvasElement): void {
    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
    if (!gl) {
      throw new Error("WebGL 2.0 not supported");
    }

    const vertexShader = this.createShader(
      gl,
      gl.VERTEX_SHADER,
      this.vertexShaderSource
    );
    const fragmentShader = this.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      this.fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader) return;

    const program = this.createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    this.setupBuffers(gl, program);
    this.resizeCanvasToDisplaySize(canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution")!;
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    const mouseLocation = gl.getUniformLocation(program, "u_mouse")!;
    const timeLocation = gl.getUniformLocation(program, "u_time")!;

    this.contexts.set(canvas, {
      gl,
      program,
      mouseLocation,
      resolutionLocation,
      timeLocation,
    });

    this.animate(gl, timeLocation);
    this.handleResize(canvas, resolutionLocation);
  }

  setMouseCoordinates(canvas: HTMLCanvasElement, x: number, y: number): void {
    const context = this.contexts.get(canvas);
    if (context) {
      const { gl, mouseLocation } = context;
      gl.uniform2f(mouseLocation, x, gl.canvas.height - y); // invert Y axis
    }
  }

  private createShader(
    gl: WebGL2RenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) {
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    }
    gl.deleteShader(shader);
    return null;
  }

  private createProgram(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram | null {
    const program = gl.createProgram();
    if (!program) {
      return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return program;
    }

    gl.deleteProgram(program);
    return null;
  }

  private setupBuffers(
    gl: WebGL2RenderingContext,
    program: WebGLProgram
  ): void {
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);

    const size = 2,
      type = gl.FLOAT,
      normalize = false,
      stride = 0,
      offset = 0;
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );
    gl.bindVertexArray(vao);
  }

  private animate(
    gl: WebGL2RenderingContext,
    timeLocation: WebGLUniformLocation
  ): void {
    const render = (time: number) => {
      gl.uniform1f(timeLocation, time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  private handleResize(
    canvas: HTMLCanvasElement,
    resolutionLocation: WebGLUniformLocation
  ): void {
    window.addEventListener("resize", () => {
      this.resizeCanvasToDisplaySize(canvas);
      const context = this.contexts.get(canvas);
      if (context) {
        const { gl } = context;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      }
    });
  }

  private resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): void {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  }
}
