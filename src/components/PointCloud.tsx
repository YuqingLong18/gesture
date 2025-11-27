import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../store';

const PointCloud = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const particlesCount = 10000;
    const positions = useMemo(() => {
        const positions = new Float32Array(particlesCount * 3);

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

        return positions;
    }, []);

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
