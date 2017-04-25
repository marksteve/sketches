// http://glslsandbox.com/e#34027.0

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

vec3 iResolution;
vec4 iMouse;
float iGlobalTime;

// by @301z

float rand(vec2 n) {
	return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

// Genera ruido en función de las coordenadas del pixel
float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
	vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

// Fractional Brownian Amplitude. Suma varias "capas" de ruido.
float fbm(vec2 n) {
	float total = 0.0, amplitude = 1.0;
	for (int i = 0; i < 4; i++) {
		total += noise(n) * amplitude;
		n += n;
		amplitude *= 0.5;
	}
	return total;
}

#define LEVELS 2.0

float dither_comp(float threshold, float value)
{
	return mod(value * LEVELS, 1.0) >= threshold? floor(value * LEVELS + 1.0) / LEVELS : floor(value * LEVELS) / LEVELS;
}

vec4 dither(vec2 pos, vec4 color)
{
	float threshold =
		  mod(floor(pos.x) + floor(pos.y), 2.0) / 2.0
		+ mod(floor(pos.x), 2.0) / 4.0
		+ mod(floor(pos.x / 2.0) + floor(pos.y / 2.0), 2.0) / 8.0
		+ mod(floor(pos.x / 2.0), 2.0) / 16.0
		+ mod(floor(pos.x / 4.0) + floor(pos.y / 4.0), 2.0) / 32.0
		+ mod(floor(pos.x / 4.0), 2.0) / 64.0
		+ 1.0 / 128.0;
	return vec4(dither_comp(threshold, color.x), dither_comp(threshold, color.y), dither_comp(threshold, color.z), color.w);
}

void main() {
	iResolution = vec3(resolution.x,resolution.y,100.);
	iMouse = vec4(mouse.x,mouse.y,5.,5.);
	iGlobalTime = time;

	// Colores
	const vec3 c1 = vec3(0.5, 0.5, 0.1); // Rojo oscuro.
	const vec3 c2 = vec3(0.9, 0.0, 0.0); // Rojo claro.
	const vec3 c3 = vec3(0.2, 0.0, 0.0); // Rojo oscuro.
	const vec3 c4 = vec3(1.0, 0.9, 0.0); // Amarillo.
	const vec3 c5 = vec3(0.1); // Gris oscuro.
	const vec3 c6 = vec3(0.9); // Gris claro.

	vec2 p = gl_FragCoord.xy * 8.0 / iResolution.xx; // Desfasa las coordenadas para que haya más cambio de un resultado a los colindantes.
	float q = fbm(p - iGlobalTime * 0.1); // Ruido con offset para el movimiento.
	vec2 r = vec2(fbm(p + q + iGlobalTime * 0.7 - p.x - p.y), fbm(p + q - iGlobalTime * 0.4));
	vec3 c = mix(c1, c2, fbm(p + r)) + mix(c3, c4, r.x) - mix(c5, c6, r.y);
	gl_FragColor = vec4(c *
			    cos(1.57 * gl_FragCoord.y / iResolution.y), // Gradiente más ocuro arriba.
			    1.0);
	gl_FragColor = dither(gl_FragCoord.xy, gl_FragColor);
	gl_FragColor = dither(gl_FragCoord.xy, vec4(length(gl_FragColor)/sqrt(3.)));
}

