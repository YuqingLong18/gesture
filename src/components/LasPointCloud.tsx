import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LASLoader } from '@loaders.gl/las';
import { load } from '@loaders.gl/core';
import { useGestureStore } from '../store';

const LasPointCloud = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLas = async () => {
            try {
                const data = await load('/Temple of Hera.las', LASLoader);

                // Extract positions
                if (!data.header) {
                    console.error('No header found in LAS file');
                    return;
                }
                const count = data.header.vertexCount;
                const positionAttribute = data.attributes.POSITION;

                if (!positionAttribute) {
                    console.error('No position attribute found in LAS file');
                    return;
                }

                const rawPositions = positionAttribute.value;
                const centeredPositions = new Float32Array(count * 3);

                // Calculate center to normalize
                let minX = Infinity, minY = Infinity, minZ = Infinity;
                let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

                // Stride is usually 3 for POSITION
                for (let i = 0; i < count; i++) {
                    const x = rawPositions[i * 3];
                    const y = rawPositions[i * 3 + 1];
                    const z = rawPositions[i * 3 + 2];

                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (z < minZ) minZ = z;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                    if (z > maxZ) maxZ = z;
                }

                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                const centerZ = (minZ + maxZ) / 2;

                // Scale factor to fit in view (approx 10 units size)
                const maxDim = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
                const scale = 10 / maxDim; // Make it size 10

                for (let i = 0; i < count; i++) {
                    centeredPositions[i * 3] = (rawPositions[i * 3] - centerX) * scale;
                    // Swap Y and Z if needed, or just keep as is. LAS is usually Z-up. 
                    // Three.js is Y-up. Let's rotate -90 deg X later or swap here.
                    // Actually, let's keep it raw and rotate the container if needed.
                    // But standard LAS often needs -90 rotation on X to look right in Three.js default camera.
                    // Let's just center for now.
                    centeredPositions[i * 3 + 1] = (rawPositions[i * 3 + 1] - centerY) * scale;
                    centeredPositions[i * 3 + 2] = (rawPositions[i * 3 + 2] - centerZ) * scale;
                }

                const newGeometry = new THREE.BufferGeometry();
                newGeometry.setAttribute('position', new THREE.BufferAttribute(centeredPositions, 3));

                // Extract colors if available
                if (data.attributes.COLOR_0) {
                    const rawColors = data.attributes.COLOR_0.value;
                    const normalizedColors = new Float32Array(count * 3);
                    // Check if 8-bit or 16-bit. Usually 16-bit in LAS (0-65535).

                    for (let i = 0; i < count * 3; i++) {
                        normalizedColors[i] = rawColors[i] / 65535;
                    }
                    newGeometry.setAttribute('color', new THREE.BufferAttribute(normalizedColors, 3));
                } else {
                    // Fallback color
                    const fallbackColors = new Float32Array(count * 3);
                    for (let i = 0; i < count; i++) {
                        fallbackColors[i * 3] = 0.5;
                        fallbackColors[i * 3 + 1] = 0.8;
                        fallbackColors[i * 3 + 2] = 1.0;
                    }
                    newGeometry.setAttribute('color', new THREE.BufferAttribute(fallbackColors, 3));
                }

                setGeometry(newGeometry);
                setLoading(false);
            } catch (error) {
                console.error('Error loading LAS file:', error);
                setLoading(false);
            }
        };

        loadLas();
    }, []);

    useFrame((_state, _delta) => {
        const { rotation, scale, position } = useGestureStore.getState();

        if (pointsRef.current) {
            // Smooth interpolation
            pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, rotation.x - Math.PI / 2, 0.1); // -PI/2 to orient Z-up LAS to Y-up Three.js
            pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, rotation.y, 0.1);
            // pointsRef.current.rotation.z = THREE.MathUtils.lerp(pointsRef.current.rotation.z, rotation.z, 0.1);

            pointsRef.current.scale.setScalar(THREE.MathUtils.lerp(pointsRef.current.scale.x, scale, 0.1));

            pointsRef.current.position.lerp(new THREE.Vector3(position.x, position.y, position.z), 0.1);
        }
    });

    if (loading || !geometry) return null;

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                size={0.1}
                vertexColors={true}
                sizeAttenuation={true}
                transparent={false}
                opacity={1.0}
            />
        </points>
    );
};

export default LasPointCloud;
