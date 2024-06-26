// src/app/webgl.service.ts
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

  constructor() {}

  async loadFragmentShader(url: string): Promise<void> {
    try {
      // console.log("Fetching shader from URL:", url);
      const response = await fetch(url);
      // console.log("Response received:", response);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Directly fetch the text content without checking content type
      const text = await response.text();
      // console.log("Shader source loaded successfully:", text);
      this.fragmentShaderSource = text;
    } catch (error) {
      console.error("Failed to load shader source:", error);
    }
  }

  initWebGL(canvas: HTMLCanvasElement): void {
    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

    if (!gl) {
      console.error("WebGL 2.0 not supported");
      return;
    }

    // Compile shaders
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

    if (!vertexShader || !fragmentShader) {
      console.error("Failed to create shaders");
      return;
    }

    // Link shaders to create a program
    const program = this.createProgram(gl, vertexShader, fragmentShader)!;

    if (!program) {
      console.error("Failed to create program");
      return;
    }

    // Look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    );

    // Create a buffer and put a single clipspace rectangle in it (2 triangles)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a vertex array object (attribute state)
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Resize the canvas to display size
    this.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want
    gl.bindVertexArray(vao);

    // Set the resolution uniform
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution")!;
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // Set the mouse uniform
    const mouseLocation = gl.getUniformLocation(program, "u_mouse")!;

    // Set the time uniform
    const timeLocation = gl.getUniformLocation(program, "u_time")!;

    this.contexts.set(canvas, {
      gl,
      program,
      mouseLocation,
      resolutionLocation,
      timeLocation,
    });

    // Animation loop
    const render = (time: number) => {
      // Update the time uniform
      gl.uniform1f(timeLocation, time * 0.001);

      // Draw the rectangle
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    // Handle window resize
    window.addEventListener("resize", () => {
      this.resizeCanvasToDisplaySize(canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    });
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
      console.error("Unable to create shader");
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.error(gl.getShaderInfoLog(shader));
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
      console.error("Unable to create program");
      return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
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
