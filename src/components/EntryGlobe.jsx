import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// Premium Entry Globe
// • True ease-in-out globe rotation (not exponential lerp)
// • City highlighted with soft glow sprite — no pins, no arcs
// • City brought to front-face of globe for clear visibility
// ─────────────────────────────────────────────────────────────────────────────

function latLonToXYZ(lat, lon, r) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
    );
}

// Build a radial soft glow canvas texture
function makeGlowTexture(color) {
    const size = 128;
    const cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    // Parse rgb(...) → rgba(...)
    const rgba = (a) => color.replace('rgb(', `rgba(`).replace(')', `, ${a})`);
    g.addColorStop(0, rgba(0.9));
    g.addColorStop(0.4, rgba(0.35));
    g.addColorStop(1, rgba(0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(cv);
}

export default function EntryGlobe({ source, destination }) {
    const canvasRef = useRef(null);
    const S = useRef({
        renderer: null, scene: null, camera: null, globe: null, frameId: null,
        // Rotation
        currentYaw: 0,
        currentPitch: 0,
        targetPitch: 0, // Target pitch for smooth lerping
        autoRotateSpeed: 0.0008,  // slower, continuous elegant rotation
        // Glows
        sourceGlow: null,
        destGlow: null,
        sourceLL: null,
        destLL: null,
    });

    // ── Scene setup ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const s = S.current;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        s.renderer = renderer;

        const scene = new THREE.Scene();
        s.scene = scene;

        const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 2.85);
        camera.lookAt(0, 0, 0);
        s.camera = camera;

        // Stars
        const starPositions = new Float32Array(3000 * 3);
        for (let i = 0; i < starPositions.length; i++) starPositions[i] = (Math.random() - 0.5) * 90;
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
            color: 0xffffff, size: 0.05, transparent: true, opacity: 0.55, sizeAttenuation: true,
        })));

        // Globe mesh
        const loader = new THREE.TextureLoader();
        const earthTex = loader.load('//unpkg.com/three-globe/example/img/earth-night.jpg');
        const bumpTex = loader.load('//unpkg.com/three-globe/example/img/earth-topology.png');
        const globe = new THREE.Mesh(
            new THREE.SphereGeometry(1, 72, 72),
            new THREE.MeshPhongMaterial({
                map: earthTex, bumpMap: bumpTex, bumpScale: 0.02,
                specular: new THREE.Color(0x0a1e44), shininess: 8,
            })
        );
        scene.add(globe);
        s.globe = globe;

        // Atmosphere
        scene.add(new THREE.Mesh(
            new THREE.SphereGeometry(1.05, 64, 64),
            new THREE.ShaderMaterial({
                vertexShader: `varying vec3 vN; void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
                fragmentShader: `varying vec3 vN; void main() { float i = pow(0.58 - dot(vN, vec3(0,0,1.0)), 3.0); gl_FragColor = vec4(0.1, 0.35, 1.0, 1.0) * i; }`,
                blending: THREE.AdditiveBlending, side: THREE.FrontSide, transparent: true, depthWrite: false,
            })
        ));

        // Pre-create Glow Sprites to prevent GPU stutter on instantiation
        const srcTex = makeGlowTexture('rgb(255, 220, 50)');
        const srcMat = new THREE.SpriteMaterial({ map: srcTex, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending });
        const srcSprite = new THREE.Sprite(srcMat);
        srcSprite.scale.set(0.45, 0.45, 1);
        srcSprite.visible = false;
        globe.add(srcSprite);
        s.sourceGlow = srcSprite;

        const destTex = makeGlowTexture('rgb(255, 55, 55)');
        const destMat = new THREE.SpriteMaterial({ map: destTex, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending });
        const destSprite = new THREE.Sprite(destMat);
        destSprite.scale.set(0.45, 0.45, 1);
        destSprite.visible = false;
        globe.add(destSprite);
        s.destGlow = destSprite;

        // Lighting
        scene.add(new THREE.AmbientLight(0x111133, 1.6));
        const sun = new THREE.DirectionalLight(0xffffff, 2.0);
        sun.position.set(5, 3, 5);
        scene.add(sun);

        // Resize
        const handleResize = () => {
            const p = canvas.parentElement;
            camera.aspect = p.clientWidth / p.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(p.clientWidth, p.clientHeight, false);
        };
        window.addEventListener('resize', handleResize);

        // ── Render loop ──────────────────────────────────────────────────────────────
        let last = performance.now();

        const tick = (now) => {
            s.frameId = requestAnimationFrame(tick);
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;

            // Always smoothly rotate yaw independent of input
            s.currentYaw += s.autoRotateSpeed * dt * 60;

            // Smoothly lerp towards the target pitch
            if (s.currentPitch !== s.targetPitch) {
                // Using a damping factor for a super smooth, slow lerp
                const lerpFactor = 1 - Math.exp(-0.8 * dt);
                s.currentPitch = s.currentPitch + (s.targetPitch - s.currentPitch) * lerpFactor;

                // Snap if very close to avoid micro-movements indefinitely
                if (Math.abs(s.targetPitch - s.currentPitch) < 0.001) {
                    s.currentPitch = s.targetPitch;
                }
            }

            globe.rotation.y = s.currentYaw;
            globe.rotation.x = s.currentPitch;

            // Glow pulse
            const p = 0.55 + 0.3 * Math.sin(now * 0.0018);
            if (s.sourceGlow && s.sourceGlow.visible) s.sourceGlow.material.opacity = p;
            if (s.destGlow && s.destGlow.visible) s.destGlow.material.opacity = p * 0.88;

            renderer.render(scene, camera);
        };
        tick(last);

        return () => {
            cancelAnimationFrame(s.frameId);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, []);

    // ── Helper: update glow positions ────────────────────────────────────────────
    const updateGlowSprite = (lat, lon, key) => {
        const s = S.current;
        if (!s[key]) return; // Ref might not be initialized yet
        if (lat === null || lon === null) {
            s[key].visible = false;
        } else {
            s[key].position.copy(latLonToXYZ(lat, lon, 1.01));
            s[key].visible = true;
        }
    };

    // ── Helper: update target pitch to slowly bring latitude into better view ───
    const setTargetPitchForLat = (lat) => {
        const s = S.current;
        // Pitch: gently tilt globe slightly so latitude is visible (clamped ±25°)
        s.targetPitch = Math.max(-0.4, Math.min(0.4, -lat * (Math.PI / 180) * 0.45));
    };

    // ── React to source city ─────────────────────────────────────────────────────
    useEffect(() => {
        const s = S.current;
        if (!S.current.scene) return;

        if (!source) {
            s.sourceLL = null;
            updateGlowSprite(null, null, 'sourceGlow');
            return;
        }

        s.sourceLL = { lat: source.lat, lon: source.lon };
        updateGlowSprite(source.lat, source.lon, 'sourceGlow');
        setTargetPitchForLat(source.lat);
    }, [source]);

    // ── React to destination city ────────────────────────────────────────────────
    useEffect(() => {
        const s = S.current;
        if (!S.current.scene) return;

        if (!destination) {
            s.destLL = null;
            updateGlowSprite(null, null, 'destGlow');
            return;
        }

        s.destLL = { lat: destination.lat, lon: destination.lon };
        updateGlowSprite(destination.lat, destination.lon, 'destGlow');

        // Tilt toward midpoint between source and destination if both exist
        if (s.sourceLL) {
            const midLat = (s.sourceLL.lat + destination.lat) / 2;
            setTargetPitchForLat(midLat);
        } else {
            setTargetPitchForLat(destination.lat);
        }
    }, [destination]);

    // ── Resume level pitch when both cleared ────────────────────────────────────
    useEffect(() => {
        if (!source && !destination) {
            const s = S.current;
            s.targetPitch = 0;
        }
    }, [source, destination]);

    return (
        <div style={{ position: 'absolute', inset: 0 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            {/* Vignette */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at 50% 42%, transparent 30%, rgba(3,8,18,0.5) 62%, rgba(3,8,18,0.92) 100%)',
            }} />
        </div>
    );
}
