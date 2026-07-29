import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ForestScene — "Brasas Ascendentes"
 * ------------------------------------------------------------------
 * Fundo 3D imersivo da landing "Os Ressurgentes".
 * Conceito: partículas de brasa/névoa subindo através de uma floresta
 * escura. O movimento vertical reforça a metáfora do ressurgir.
 *
 * Interatividade:
 *  - Mouse: câmera com parallax sutil (vento leve).
 *  - Scroll: acelera a subida das brasas e aproxima o ponto de fuga.
 *  - Automático: rotação contínua lenta do campo de partículas.
 *
 * Performance:
 *  - Um único Points draw call (BufferGeometry + ShaderMaterial).
 *  - Sem texturas: brasa é desenhada proceduralmente no fragment shader.
 *  - Additive blending + depthWrite:false para névoa "livre".
 *  - DPR clamped em 1.5, contagem adaptativa por largura de tela.
 *  - Respeita prefers-reduced-motion (desativa auto-rotate + reduz partículas).
 *  - Pausa render quando aba não está visível.
 * ------------------------------------------------------------------ */
export default function ForestScene({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as any).connection?.saveData === true;
    const lowMem = ((navigator as any).deviceMemory ?? 8) < 4;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const width = () => mount.clientWidth;
    const height = () => mount.clientHeight;

    // --- Renderer ------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    // DPR mais agressivo em mobile: 1.0 mobile, 1.25 low-mem, 1.5 desktop.
    const dprCap = isMobile ? 1 : lowMem ? 1.25 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
    renderer.setSize(width(), height());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;";

    // --- Cena / câmera / fog ------------------------------------------
    const scene = new THREE.Scene();
    // Fog exponencial dá a sensação de profundidade da floresta.
    scene.fog = new THREE.FogExp2(0x0d0f0e, 0.045);

    const camera = new THREE.PerspectiveCamera(55, width() / height(), 0.1, 200);
    camera.position.set(0, 0, 22);

    // --- Contagem adaptativa ------------------------------------------
    // Adaptativa por tela + memória + Save-Data + reduced-motion.
    let base = isMobile ? 1200 : width() < 1200 ? 2600 : 4200;
    if (lowMem) base = Math.floor(base * 0.6);
    if (saveData) base = Math.floor(base * 0.5);
    const COUNT = reduced ? Math.floor(base * 0.4) : base;

    // --- Geometria das brasas -----------------------------------------
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);      // fase individual
    const sizes = new Float32Array(COUNT);      // variação de tamanho
    const speeds = new Float32Array(COUNT);     // velocidade de subida

    for (let i = 0; i < COUNT; i++) {
      // Distribuição em coluna vertical ampla (cilindro).
      const radius = Math.pow(Math.random(), 0.6) * 28;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3 + 0] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60; // altura
      positions[i * 3 + 2] = Math.sin(theta) * radius - 10;

      seeds[i] = Math.random() * 100;
      sizes[i] = 0.6 + Math.random() * 2.2;
      speeds[i] = 0.4 + Math.random() * 1.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));

    // --- Shader: brasa procedural -------------------------------------
    // Cores: gold (#A68A55), sand (#C9B99A), moss deep (#223B2B).
    const uniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },   // 0..1, dirige brilho + velocidade
      uWind: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uColorHot: { value: new THREE.Color("#A68A55") },
      uColorCool: { value: new THREE.Color("#2F4F3A") },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aSize;
        attribute float aSpeed;
        uniform float uTime;
        uniform float uScroll;
        uniform vec2  uWind;
        uniform float uPixelRatio;
        varying float vLife;

        void main() {
          vec3 p = position;
          // Subida contínua; scroll acelera. Loop no eixo Y.
          float rise = uTime * (0.6 + uScroll * 1.4) * aSpeed;
          p.y = mod(p.y + rise + 30.0, 60.0) - 30.0;
          // Vento lateral: deslocamento suave baseado em seno + mouse.
          p.x += sin(uTime * 0.4 + aSeed) * 0.6 + uWind.x * 4.0;
          p.z += cos(uTime * 0.3 + aSeed * 1.3) * 0.4 + uWind.y * 2.0;

          // vida: fade-in embaixo, fade-out em cima.
          vLife = smoothstep(-30.0, -18.0, p.y) * (1.0 - smoothstep(15.0, 30.0, p.y));

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          // size perspectivo — partículas distantes ficam menores.
          gl_PointSize = aSize * uPixelRatio * (140.0 / -mv.z);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uScroll;
        uniform vec3  uColorHot;
        uniform vec3  uColorCool;
        varying float vLife;

        void main() {
          // círculo suave (halo gaussiano).
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float glow = exp(-d * 8.0);

          // mix cor fria (musgo) → quente (ouro) conforme scroll+vida.
          vec3 col = mix(uColorCool, uColorHot, clamp(vLife + uScroll * 0.4, 0.0, 1.0));
          float alpha = glow * vLife * 0.9;
          gl_FragColor = vec4(col * glow * 1.4, alpha);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- Interatividade -----------------------------------------------
    const mouse = new THREE.Vector2(0, 0);
    const target = new THREE.Vector2(0, 0);

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      uniforms.uScroll.value = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    };
    const onResize = () => {
      renderer.setSize(width(), height());
      camera.aspect = width() / height();
      camera.updateProjectionMatrix();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    // --- Loop com pausa em background ---------------------------------
    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      uniforms.uTime.value += dt;

      // easing do mouse (parallax suave da câmera + vento nas partículas)
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;
      camera.position.x = mouse.x * 1.6;
      camera.position.y = -mouse.y * 1.0 + uniforms.uScroll.value * 4.0;
      camera.lookAt(0, 0, 0);
      uniforms.uWind.value.set(mouse.x * 0.2, mouse.y * 0.1);

      if (!reduced) points.rotation.y += dt * 0.02;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        clock.getDelta();
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // --- Cleanup ------------------------------------------------------
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
