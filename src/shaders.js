export const statueVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const statueFragmentShader = `
uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    vec3 light = normalize(vNormal + vec3(0.0, 0.0, 1.0));
    vec4 texColor = texture2D(uTexture, vUv);
    float glow = 0.5 + 0.5 * sin(uTime + length(vUv) * 10.0);
    gl_FragColor = vec4(texColor.rgb * glow * dot(light, vec3(0.0,1.0,0.5)), texColor.a);
}
`;