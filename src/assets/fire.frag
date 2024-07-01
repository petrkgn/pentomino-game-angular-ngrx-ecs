#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define SMOOTH 1

#if SMOOTH
#define FLAME_BASE_WIDTH .012
#else
#define FLAME_BASE_WIDTH .0
#endif

float rand(float n) {
    return fract(sin(n) * 43758.5453);
}

float noise(float seed, float x, float frequency) {
    seed *= 1337.0;
    float i = floor(frequency * x);
    float f = fract(frequency * x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(rand(seed + i), rand(seed + i + 1.0), u);
}

float line(vec2 uv) {
    float center = 0.1 * (noise(1.0, uv.y, 5.0) + 0.8 * noise(2.0, uv.y, 10.0) - 0.2);
    float width = FLAME_BASE_WIDTH + 0.04 * (noise(3.0, uv.y, 3.0) + 0.8 * noise(4.0, uv.y, 10.0));

    #if SMOOTH
    if (uv.x < center - width) return 0.0;
    if (uv.x < center) return smoothstep(center - width, center - 0.7 * width, uv.x);
    if (uv.x < center + width) return 1.0 - smoothstep(center + 0.7 * width, center + width, uv.x);
    return 0.0;
    #else
    return step(center - width, uv.x) - step(center + width, uv.x);
    #endif
}

vec2 rot(vec2 uv, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return uv * mat2(c, -s, s, c);
}

float flame(vec2 uv, float spread, float p) {
    return line(rot(uv, 3.14 - spread) + vec2(0.0, p + u_time)) *
           line(rot(uv, 3.14 + spread) + vec2(0.0, p + u_time));
}

vec3 fire_color(float intensity) {
    return vec3(1.0, 0.0, 0.0) * intensity +
           vec3(1.0, 1.0, 0.0) * clamp(intensity - 0.5, 0.0, 1.0) +
           vec3(1.0, 1.0, 1.0) * clamp(intensity - 0.7, 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - vec2(0.5 * u_resolution.x, 0.0)) / u_resolution.y - vec2(0.0, 0.5);
    vec2 mouse_uv = u_mouse / u_resolution;
    uv += mouse_uv - 0.5;

    const int fire_n = 30;
    float fire_intensity = 0.5;
    for (int i = 0; i < fire_n; ++i) {
        float t = float(i) / float(fire_n) - 0.5;
        fire_intensity += flame(uv + vec2(0.0, 0.08 + 0.3 * t), 0.15 + 0.1 * t, 273.0 * float(i));
    }

    vec3 color = fire_color(2.0 * fire_intensity / float(fire_n));
    float alpha = fire_intensity / float(fire_n);

    vec3 backgroundColor = vec3(0.0, 0.0, 0.0);
    vec3 finalColor = mix(backgroundColor, color, alpha);
    fragColor = vec4(finalColor, alpha);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
