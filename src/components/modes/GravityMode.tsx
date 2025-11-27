import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../../store';

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
    
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5); 

    gl_FragColor = vec4(vColor, glow);
  }
`;

const PARTICLE_COUNT = 5000;
const GRAVITY_STRENGTH = 0.5;
const REPULSOR_STRENGTH = 0.8;
const DAMPING = 0.98;
const MAX_VELOCITY = 0.5;

const GravityMode = () => {
    const pointsRef = useRef<THREE.Points>(null);

    // Particle physics state
    const velocities = useRef(new Float32Array(PARTICLE_COUNT * 3));
    const positions = useRef(new Float32Array(PARTICLE_COUNT * 3));
    const colors = useRef(new Float32Array(PARTICLE_COUNT * 3));
    const sizes = useRef(new Float32Array(PARTICLE_COUNT));

    // Initialize particles
    useMemo(() => {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Random positions in a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.random() * 10;

            positions.current[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions.current[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions.current[i * 3 + 2] = r * Math.cos(phi);

            // Initial velocities (small random)
            velocities.current[i * 3] = (Math.random() - 0.5) * 0.1;
            velocities.current[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

            // Initial colors (blue)
            colors.current[i * 3] = 0.2;
            colors.current[i * 3 + 1] = 0.5;
            colors.current[i * 3 + 2] = 1.0;

            sizes.current[i] = Math.random() * 0.3 + 0.1;
        }
    }, []);

    useFrame((_state, _delta) => {
        const { position } = useGestureStore.getState();

        // Right hand = attractor (gravity well)
        const attractorPos = new THREE.Vector3(position.x, position.y, position.z);

        // Left hand = repulsor (we'll use negative position for now)
        const repulsorPos = new THREE.Vector3(-position.x, position.y, position.z);

        if (pointsRef.current) {
            const posAttr = pointsRef.current.geometry.attributes.position;
            const colorAttr = pointsRef.current.geometry.attributes.color;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const px = positions.current[i * 3];
                const py = positions.current[i * 3 + 1];
                const pz = positions.current[i * 3 + 2];

                // Calculate forces from attractor
                const dx = attractorPos.x - px;
                const dy = attractorPos.y - py;
                const dz = attractorPos.z - pz;
                const distSq = dx * dx + dy * dy + dz * dz + 0.1; // Add epsilon to avoid division by zero
                const dist = Math.sqrt(distSq);
                const force = GRAVITY_STRENGTH / distSq;

                // Apply attractor force
                velocities.current[i * 3] += (dx / dist) * force;
                velocities.current[i * 3 + 1] += (dy / dist) * force;
                velocities.current[i * 3 + 2] += (dz / dist) * force;

                // Calculate forces from repulsor
                const rdx = repulsorPos.x - px;
                const rdy = repulsorPos.y - py;
                const rdz = repulsorPos.z - pz;
                const rdistSq = rdx * rdx + rdy * rdy + rdz * rdz + 0.1;
                const rdist = Math.sqrt(rdistSq);
                const rforce = REPULSOR_STRENGTH / rdistSq;

                // Apply repulsor force (negative)
                velocities.current[i * 3] -= (rdx / rdist) * rforce;
                velocities.current[i * 3 + 1] -= (rdy / rdist) * rforce;
                velocities.current[i * 3 + 2] -= (rdz / rdist) * rforce;

                // Apply damping
                velocities.current[i * 3] *= DAMPING;
                velocities.current[i * 3 + 1] *= DAMPING;
                velocities.current[i * 3 + 2] *= DAMPING;

                // Clamp velocity
                const vx = velocities.current[i * 3];
                const vy = velocities.current[i * 3 + 1];
                const vz = velocities.current[i * 3 + 2];
                const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
                if (speed > MAX_VELOCITY) {
                    const scale = MAX_VELOCITY / speed;
                    velocities.current[i * 3] *= scale;
                    velocities.current[i * 3 + 1] *= scale;
                    velocities.current[i * 3 + 2] *= scale;
                }

                // Update positions
                positions.current[i * 3] += velocities.current[i * 3];
                positions.current[i * 3 + 1] += velocities.current[i * 3 + 1];
                positions.current[i * 3 + 2] += velocities.current[i * 3 + 2];

                // Update colors based on velocity (speed)
                const normalizedSpeed = Math.min(speed / MAX_VELOCITY, 1);
                colors.current[i * 3] = normalizedSpeed; // Red increases with speed
                colors.current[i * 3 + 1] = 0.5 * (1 - normalizedSpeed); // Green decreases
                colors.current[i * 3 + 2] = 1.0 - normalizedSpeed; // Blue decreases

                // Update buffer attributes
                posAttr.setXYZ(i, positions.current[i * 3], positions.current[i * 3 + 1], positions.current[i * 3 + 2]);
                colorAttr.setXYZ(i, colors.current[i * 3], colors.current[i * 3 + 1], colors.current[i * 3 + 2]);
            }

            posAttr.needsUpdate = true;
            colorAttr.needsUpdate = true;
        }
    });

    const uniforms = useMemo(() => ({}), []);

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={PARTICLE_COUNT}
                    array={positions.current}
                    itemSize={3}
                    args={[positions.current, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={PARTICLE_COUNT}
                    array={colors.current}
                    itemSize={3}
                    args={[colors.current, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={PARTICLE_COUNT}
                    array={sizes.current}
                    itemSize={1}
                    args={[sizes.current, 1]}
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

export default GravityMode;
