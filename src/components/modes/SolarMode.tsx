import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../../store';
import { Sphere } from '@react-three/drei';

interface Planet {
    name: string;
    radius: number;
    color: string;
    orbitRadius: number;
    orbitSpeed: number;
    angle: number;
}

const SolarMode = () => {
    const groupRef = useRef<THREE.Group>(null);
    const timeScale = useRef(1);

    const planets = useRef<Planet[]>([
        { name: 'Mercury', radius: 0.3, color: '#8c7853', orbitRadius: 3, orbitSpeed: 4.15, angle: 0 },
        { name: 'Venus', radius: 0.5, color: '#ffc649', orbitRadius: 4.5, orbitSpeed: 1.62, angle: 0 },
        { name: 'Earth', radius: 0.5, color: '#4a90e2', orbitRadius: 6, orbitSpeed: 1.0, angle: 0 },
        { name: 'Mars', radius: 0.4, color: '#e27b58', orbitRadius: 7.5, orbitSpeed: 0.53, angle: 0 },
        { name: 'Jupiter', radius: 1.2, color: '#c88b3a', orbitRadius: 10, orbitSpeed: 0.08, angle: 0 },
        { name: 'Saturn', radius: 1.0, color: '#fad5a5', orbitRadius: 13, orbitSpeed: 0.03, angle: 0 },
    ]);

    useFrame((_state, delta) => {
        const { scale, position } = useGestureStore.getState();

        // Map hand Y position to time scale (-5 to 5 -> 0.1 to 5)
        timeScale.current = Math.max(0.1, Math.min(5, 1 + position.y * 0.5));

        if (groupRef.current) {
            // Update planet positions
            planets.current.forEach((planet) => {
                planet.angle += planet.orbitSpeed * delta * timeScale.current * 0.1;
            });

            // Apply scale
            groupRef.current.scale.setScalar(scale * 0.5);
            groupRef.current.position.lerp(new THREE.Vector3(position.x * 0.5, 0, position.z), 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            {/* Sun */}
            <Sphere args={[1.5, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#fdb813" emissive="#fdb813" emissiveIntensity={0.8} />
            </Sphere>

            {/* Orbit rings */}
            {planets.current.map((planet, idx) => (
                <mesh key={`orbit-${idx}`} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[planet.orbitRadius - 0.02, planet.orbitRadius + 0.02, 64]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
                </mesh>
            ))}

            {/* Planets */}
            {planets.current.map((planet, idx) => {
                const x = Math.cos(planet.angle) * planet.orbitRadius;
                const z = Math.sin(planet.angle) * planet.orbitRadius;

                return (
                    <Sphere key={`planet-${idx}`} args={[planet.radius, 32, 32]} position={[x, 0, z]}>
                        <meshStandardMaterial color={planet.color} metalness={0.2} roughness={0.8} />
                    </Sphere>
                );
            })}
        </group>
    );
};

export default SolarMode;
