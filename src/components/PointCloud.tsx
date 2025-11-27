import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../store';

const PointCloud = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const particlesCount = 10000;
    const shape = useGestureStore((state) => state.shape);

    const positions = useMemo(() => {
        const positions = new Float32Array(particlesCount * 3);

        const generateRing = () => {
            // Planet particles (Sphere) - 70% of particles
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
            }

            // Ring particles (Disc) - 30% of particles
            const ringInnerRadius = 10;
            const ringOuterRadius = 15;

            for (let i = planetParticles; i < particlesCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                // Distribute particles in the ring area
                const r = Math.sqrt(Math.random() * (ringOuterRadius ** 2 - ringInnerRadius ** 2) + ringInnerRadius ** 2);

                const x = r * Math.cos(angle);
                const z = r * Math.sin(angle);
                const y = (Math.random() - 0.5) * 0.2; // Slight thickness

                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;
            }
        };

        const generateHeart = () => {
            for (let i = 0; i < particlesCount; i++) {
                // Heart formula
                // x = 16sin^3(t)
                // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
                // z = varies to give depth

                // We need to distribute points inside the volume
                // A simple way is rejection sampling or just surface + noise

                // Let's do a 3D heart approximation
                const t = Math.random() * Math.PI * 2;
                // const u = Math.random() * Math.PI; // Unused

                // Base 2D heart shape
                const xBase = 16 * Math.pow(Math.sin(t), 3);
                const yBase = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

                // Add thickness based on u
                const scale = 0.5; // Scale down to fit scene

                // Randomize slightly for volume
                const r = Math.random();
                const vol = Math.pow(r, 1 / 3); // Cube root for uniform distribution in sphere-like volume, approx here

                const x = xBase * scale * vol;
                const y = yBase * scale * vol;
                const z = (Math.random() - 0.5) * 6 * vol; // Arbitrary Z thickness

                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;
            }
        };

        const generatePolyhedron = (type: 'octahedron' | 'icosahedron') => {
            // Create a temporary geometry to sample points from
            let geometry;
            if (type === 'octahedron') {
                geometry = new THREE.OctahedronGeometry(10, 0);
            } else {
                geometry = new THREE.IcosahedronGeometry(10, 0);
            }

            // We need to sample points from the surface or volume.
            // Since we can't easily use MeshSurfaceSampler without importing it from examples,
            // we will use a simpler approach: vertices + random points on faces?
            // Or just random points in a sphere and project them?
            // Actually, for a cool effect, let's just use the vertices and subdivide or just random points on the faces.

            // Let's try a simple approach: Random points in a sphere, but normalize them to the polyhedron surface?
            // Hard to do exact polyhedron without the geometry data.
            // Let's use the geometry vertices and interpolate.

            const posAttribute = geometry.attributes.position;
            const vertexCount = posAttribute.count;

            for (let i = 0; i < particlesCount; i++) {
                // Pick a random triangle
                // Octahedron has 8 faces, Icosahedron has 20.
                // The geometry is indexed or non-indexed. Basic geometries are usually non-indexed triangles in Three.js buffer geometry if not specified? 
                // Actually OctahedronGeometry(radius, detail) creates a BufferGeometry.
                // Let's assume it's a triangle soup or we can just pick 3 random vertices that form a face?
                // Too complex to calculate faces manually without access to index.

                // Alternative: Just generate points on a sphere and snap them? No.

                // Let's just use the vertices we have and scatter points around them? 
                // No, that looks like dots.

                // Let's use a mathematical approach for Octahedron: |x| + |y| + |z| = r
                if (type === 'octahedron') {
                    // Rejection sampling for Octahedron volume
                    // |x| + |y| + |z| <= r
                    let x, y, z;
                    const r = 10;
                    while (true) {
                        x = (Math.random() - 0.5) * 2 * r;
                        y = (Math.random() - 0.5) * 2 * r;
                        z = (Math.random() - 0.5) * 2 * r;
                        if (Math.abs(x) + Math.abs(y) + Math.abs(z) <= r) break;
                    }
                    // For surface only: normalize to L1 norm?
                    // To make it look like a wireframe or surface, let's push it to the boundary.
                    // But volume looks cool too. Let's do surface.
                    const norm = Math.abs(x) + Math.abs(y) + Math.abs(z);
                    const scale = r / norm;
                    positions[i * 3] = x * scale;
                    positions[i * 3 + 1] = y * scale;
                    positions[i * 3 + 2] = z * scale;
                } else {
                    // Icosahedron is harder to do analytically.
                    // Let's just use a sphere but with a different visual style?
                    // Or actually, let's use the Geometry class if possible? No, deprecated.
                    // Let's use the BufferGeometry we created.

                    // Random point on triangle approach.
                    // We can access the raw position array.
                    const faceIndex = Math.floor(Math.random() * (vertexCount / 3));
                    const vA = new THREE.Vector3().fromBufferAttribute(posAttribute, faceIndex * 3 + 0);
                    const vB = new THREE.Vector3().fromBufferAttribute(posAttribute, faceIndex * 3 + 1);
                    const vC = new THREE.Vector3().fromBufferAttribute(posAttribute, faceIndex * 3 + 2);

                    // Random point in triangle
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
                }
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

        return positions;
    }, [shape]);

    useFrame((_state, _delta) => {
        const { rotation, scale, position } = useGestureStore.getState();

        if (pointsRef.current) {
            // Smooth interpolation
            pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, rotation.x, 0.1);
            pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, rotation.y, 0.1);

            pointsRef.current.scale.setScalar(THREE.MathUtils.lerp(pointsRef.current.scale.x, scale, 0.1));

            pointsRef.current.position.lerp(new THREE.Vector3(position.x, position.y, position.z), 0.1);


        }
    });

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
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#00ffff"
                sizeAttenuation={true}
                transparent={true}
                opacity={0.8}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

export default PointCloud;
