import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../store';

const PointCloud = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const particlesCount = 5000;
    const positions = useMemo(() => {
        const positions = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount; i++) {
            const theta = THREE.MathUtils.randFloatSpread(360);
            const phi = THREE.MathUtils.randFloatSpread(360);
            const r = 2 + Math.random() * 2; // Radius between 2 and 4

            const x = r * Math.sin(theta) * Math.cos(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(theta);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        return positions;
    }, []);

    useFrame((_state, delta) => {
        const { rotation, scale, position } = useGestureStore.getState();

        if (pointsRef.current) {
            // Smooth interpolation
            pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, rotation.x, 0.1);
            pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, rotation.y, 0.1);

            pointsRef.current.scale.setScalar(THREE.MathUtils.lerp(pointsRef.current.scale.x, scale, 0.1));

            pointsRef.current.position.lerp(new THREE.Vector3(position.x, position.y, position.z), 0.1);

            // Idle rotation
            pointsRef.current.rotation.y += delta * 0.05;
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
                size={0.05}
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
