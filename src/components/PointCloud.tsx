import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../store';

const vertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5, 0.5));
    if (r > 0.5) discard;
    
    // Soft edge / glow
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5); 

    gl_FragColor = vec4(vColor, glow);
  }
`;

const PointCloud = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const particlesCount = 30000;
    const shape = useGestureStore((state) => state.shape);

    const { positions, colors, sizes } = useMemo(() => {
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);
        const sizes = new Float32Array(particlesCount);

        const color1 = new THREE.Color('#00ffff'); // Cyan
        const color2 = new THREE.Color('#8a2be2'); // BlueViolet
        const color3 = new THREE.Color('#ff00ff'); // Magenta

        const generateRing = () => {
            const planetParticles = Math.floor(particlesCount * 0.7);
            const planetRadius = 8;

            for (let i = 0; i < planetParticles; i++) {
                const theta = THREE.MathUtils.randFloatSpread(360);
                const phi = THREE.MathUtils.randFloatSpread(360);
                const r = planetRadius;

                const x = r * Math.sin(theta) * Math.cos(phi);
                const y = r * Math.sin(theta) * Math.sin(phi);
                const z = r * Math.cos(theta);

                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;

                // Color based on position
                const mixedColor = color1.clone().lerp(color2, Math.abs(y) / r);
                colors[i * 3] = mixedColor.r;
                colors[i * 3 + 1] = mixedColor.g;
                colors[i * 3 + 2] = mixedColor.b;

                sizes[i] = Math.random() * 0.5 + 0.1;
            }

            const ringInnerRadius = 10;
            const ringOuterRadius = 15;

            for (let i = planetParticles; i < particlesCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random() * (ringOuterRadius ** 2 - ringInnerRadius ** 2) + ringInnerRadius ** 2);

                const x = r * Math.cos(angle);
                const z = r * Math.sin(angle);
                const y = (Math.random() - 0.5) * 0.5;

                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;

                const mixedColor = color2.clone().lerp(color3, (r - ringInnerRadius) / (ringOuterRadius - ringInnerRadius));
                colors[i * 3] = mixedColor.r;
                colors[i * 3 + 1] = mixedColor.g;
                colors[i * 3 + 2] = mixedColor.b;

                sizes[i] = Math.random() * 0.4 + 0.1;
            }
        };

        const generateHeart = () => {
            for (let i = 0; i < particlesCount; i++) {
                const t = Math.random() * Math.PI * 2;
                const xBase = 16 * Math.pow(Math.sin(t), 3);
                const yBase = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
                const scale = 0.5;
                const r = Math.random();
                const vol = Math.pow(r, 1 / 3);

                const x = xBase * scale * vol;
                const y = yBase * scale * vol;
                const z = (Math.random() - 0.5) * 6 * vol;

                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;

                const dist = Math.sqrt(x * x + y * y + z * z);
                const mixedColor = color3.clone().lerp(color1, dist / 10);

                colors[i * 3] = mixedColor.r;
                colors[i * 3 + 1] = mixedColor.g;
                colors[i * 3 + 2] = mixedColor.b;

                sizes[i] = Math.random() * 0.5 + 0.2;
            }
        };

        const generatePolyhedron = (type: 'octahedron' | 'icosahedron') => {
            let geometry;
            if (type === 'octahedron') {
                geometry = new THREE.OctahedronGeometry(10, 0);
            } else {
                geometry = new THREE.IcosahedronGeometry(10, 0);
            }

            const posAttribute = geometry.attributes.position;
            const vertexCount = posAttribute.count;

            for (let i = 0; i < particlesCount; i++) {
                if (type === 'octahedron') {
                    let x, y, z;
                    const r = 10;
                    while (true) {
                        x = (Math.random() - 0.5) * 2 * r;
                        y = (Math.random() - 0.5) * 2 * r;
                        z = (Math.random() - 0.5) * 2 * r;
                        if (Math.abs(x) + Math.abs(y) + Math.abs(z) <= r) break;
                    }
                    const norm = Math.abs(x) + Math.abs(y) + Math.abs(z);
                    const scale = r / norm;
                    positions[i * 3] = x * scale;
                    positions[i * 3 + 1] = y * scale;
                    positions[i * 3 + 2] = z * scale;

                    const mixedColor = color1.clone().lerp(color2, Math.abs(y) / 10);
                    colors[i * 3] = mixedColor.r;
                    colors[i * 3 + 1] = mixedColor.g;
                    colors[i * 3 + 2] = mixedColor.b;

                } else {
                    const faceIndex = Math.floor(Math.random() * (vertexCount / 3));
                    const vA = new THREE.Vector3().fromBufferAttribute(posAttribute, faceIndex * 3 + 0);
                    const vB = new THREE.Vector3().fromBufferAttribute(posAttribute, faceIndex * 3 + 1);
                    const vC = new THREE.Vector3().fromBufferAttribute(posAttribute, faceIndex * 3 + 2);

                    let r1 = Math.random();
                    let r2 = Math.random();
                    if (r1 + r2 > 1) {
                        r1 = 1 - r1;
                        r2 = 1 - r2;
                    }

                    const p = new THREE.Vector3()
                        .copy(vA)
                        .addScaledVector(new THREE.Vector3().subVectors(vB, vA), r1)
                        .addScaledVector(new THREE.Vector3().subVectors(vC, vA), r2);

                    positions[i * 3] = p.x;
                    positions[i * 3 + 1] = p.y;
                    positions[i * 3 + 2] = p.z;

                    const mixedColor = color2.clone().lerp(color3, Math.abs(p.x) / 10);
                    colors[i * 3] = mixedColor.r;
                    colors[i * 3 + 1] = mixedColor.g;
                    colors[i * 3 + 2] = mixedColor.b;
                }
                sizes[i] = Math.random() * 0.5 + 0.1;
            }
            geometry.dispose();
        };

        if (shape === 'ring') {
            generateRing();
        } else if (shape === 'heart') {
            generateHeart();
        } else if (shape === 'octahedron') {
            generatePolyhedron('octahedron');
        } else if (shape === 'icosahedron') {
            generatePolyhedron('icosahedron');
        }

        return { positions, colors, sizes };
    }, [shape]);

    useFrame((_state, _delta) => {
        const { rotation, scale, position } = useGestureStore.getState();

        if (pointsRef.current) {
            pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, rotation.x, 0.1);
            pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, rotation.y, 0.1);
            pointsRef.current.scale.setScalar(THREE.MathUtils.lerp(pointsRef.current.scale.x, scale, 0.1));
            pointsRef.current.position.lerp(new THREE.Vector3(position.x, position.y, position.z), 0.1);
        }
    });

    const uniforms = useMemo(() => ({
    }), []);

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={colors.length / 3}
                    array={colors}
                    itemSize={3}
                    args={[colors, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={sizes.length}
                    array={sizes}
                    itemSize={1}
                    args={[sizes, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={uniforms}
            />
        </points>
    );
};

export default PointCloud;
