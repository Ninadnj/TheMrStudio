import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { Vector2 } from "three";

// Custom Shader Material using R3F's shaderMaterial helper or raw ShaderMaterial
const LiquidShaderMaterial = {
    uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0, 0) },
        uResolution: { value: new Vector2(1, 1) },
        uColorStart: { value: new THREE.Color("#E6DED5") }, // Lighter Accent
        uColorEnd: { value: new THREE.Color("#D4C9BD") },   // Main Accent
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 st = vUv;
      
      // Mouse interaction
      float dist = distance(st, uMouse);
      float interaction = smoothstep(0.4, 0.0, dist);
      
      // Liquid Motion
      float n = snoise(st * 3.0 + uTime * 0.1);
      float n2 = snoise(st * 6.0 - uTime * 0.15 + interaction * 0.5);
      
      // Combine noise
      float finalNoise = n * 0.5 + n2 * 0.5;
      
      // Mix colors based on noise
      vec3 color = mix(uColorStart, uColorEnd, finalNoise + interaction * 0.2);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

function GradientPlane() {
    const mesh = useRef<THREE.Mesh>(null);
    const { viewport, mouse } = useThree();

    // Create shader material instance
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new Vector2(0, 0) },
                uResolution: { value: new Vector2(viewport.width, viewport.height) },
                uColorStart: { value: new THREE.Color("#E6DED5") },
                uColorEnd: { value: new THREE.Color("#D4C9BD") },
            },
            vertexShader: LiquidShaderMaterial.vertexShader,
            fragmentShader: LiquidShaderMaterial.fragmentShader,
        });
    }, []);

    useFrame((state) => {
        if (mesh.current) {
            material.uniforms.uTime.value = state.clock.getElapsedTime();
            // Convert mouse position (-1 to 1) to UV space (0 to 1)
            material.uniforms.uMouse.value.set(
                (state.mouse.x + 1) / 2,
                (state.mouse.y + 1) / 2
            );
        }
    });

    return (
        <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1, 32, 32]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

export default function LiquidBackground() {
    return (
        <div className="fixed inset-0 -z-50 pointer-events-none opacity-60">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <GradientPlane />
            </Canvas>
        </div>
    );
}
