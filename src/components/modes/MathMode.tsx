import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../../store';

const MathMode = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const gridSize = 50;
    const scale = 0.3;

    // Parameters controlled by hand gestures
    const paramsRef = useRef({ a: 1, b: 1 });

    const geometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const colors: number[] = [];
        const indices: number[] = [];

        const color1 = new THREE.Color('#00ffff');
        const color2 = new THREE.Color('#ff00ff');

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = (i - gridSize / 2) * scale;
                const y = (j - gridSize / 2) * scale;
                const z = 0; // Will be updated in useFrame

                vertices.push(x, z, y); // Note: swapping y and z for proper orientation

                // Color based on position
                const t = i / gridSize;
                const color = color1.clone().lerp(color2, t);
                colors.push(color.r, color.g, color.b);
            }
        }

        // Create indices for triangles
        for (let i = 0; i < gridSize - 1; i++) {
            for (let j = 0; j < gridSize - 1; j++) {
                const a = i * gridSize + j;
                const b = i * gridSize + j + 1;
                const c = (i + 1) * gridSize + j;
                const d = (i + 1) * gridSize + j + 1;

                indices.push(a, b, d);
                indices.push(a, d, c);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        return geometry;
    }, []);

    useFrame((_state, _delta) => {
        const { position, scale: gestureScale } = useGestureStore.getState();

        // Map hand position to parameters
        // X position controls 'a' (frequency in x direction)
        // Y position controls 'b' (frequency in y direction)
        paramsRef.current.a = 1 + position.x * 0.2;
        paramsRef.current.b = 1 + position.y * 0.2;

        if (meshRef.current) {
            const posAttr = meshRef.current.geometry.attributes.position;

            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const idx = i * gridSize + j;
                    const x = (i - gridSize / 2) * scale;
                    const y = (j - gridSize / 2) * scale;

                    // z = sin(a * x) * cos(b * y)
                    const z = Math.sin(paramsRef.current.a * x) * Math.cos(paramsRef.current.b * y) * 2;

                    posAttr.setY(idx, z);
                }
            }

            posAttr.needsUpdate = true;
            meshRef.current.geometry.computeVertexNormals();

            // Apply scale from gesture
            meshRef.current.scale.setScalar(gestureScale);
        }
    });

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <meshStandardMaterial
                vertexColors={true}
                wireframe={false}
                side={THREE.DoubleSide}
                metalness={0.3}
                roughness={0.7}
            />
        </mesh>
    );
};

export default MathMode;
