self.addEventListener('message', (event) => {
  const { canvas, vertexShaderSource, fragmentShaderSource, width, height, coordinates } = event.data;

  console.log('Worker received message:', event.data);

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.error('Failed to get WebGL2 context');
    return;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShader) {
    console.error('Vertex shader creation failed');
    return;
  }

  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!fragmentShader) {
    console.error('Fragment shader creation failed');
    return;
  }

  const program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    console.error('Program creation failed');
    return;
  }

  setupBuffers(gl, program);
  resizeCanvas(gl, width, height);

  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const mouseLocation = gl.getUniformLocation(program, 'u_mouse');
  const timeLocation = gl.getUniformLocation(program, 'u_time');

  if (resolutionLocation === null) console.error('Failed to get location of u_resolution');
  if (mouseLocation === null) console.error('Failed to get location of u_mouse');
  if (timeLocation === null) console.error('Failed to get location of u_time');

  if (resolutionLocation === null || mouseLocation === null || timeLocation === null) {
    return;
  }
  console.log('resolutionLocation', width, height);
  gl.uniform2f(resolutionLocation, width, height);
  gl.uniform2f(mouseLocation, coordinates.x, coordinates.y);
  gl.uniform1f(timeLocation, 0);  // Установите начальное значение для времени

  console.log('Starting animation');
  animate(gl, timeLocation);

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(`Shader ${type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'} compilation succeeded`);
      return shader;
    }
    console.error(`Shader ${type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'} compilation failed:`, gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log('Program linking succeeded');
      return program;
    }
    console.error('Program linking failed:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  function setupBuffers(gl, program) {
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    if (positionAttributeLocation < 0) {
      console.error('Failed to get the storage location of a_position');
      return;
    }
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);

    const size = 2, type = gl.FLOAT, normalize = false, stride = 0, offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    gl.bindVertexArray(vao);
  }

  function animate(gl, timeLocation) {
    const render = (time) => {
      gl.uniform1f(timeLocation, time * 0.001);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      // console.log('Drawing frame');
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  function resizeCanvas(gl, width, height) {
    gl.canvas.width = width;
    gl.canvas.height = height;
  }
});
