import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGestureStore } from '../../store';
import { Cylinder, Sphere } from '@react-three/drei';

interface Atom {
    id: number;
    element: string;
    position: [number, number, number];
    color: string;
    radius: number;
}

interface Bond {
    from: number;
    to: number;
}

interface Molecule {
    name: string;
    atoms: Atom[];
    bonds: Bond[];
}

const MOLECULES: Record<string, Molecule> = {
    water: {
        name: 'Water (H₂O)',
        atoms: [
            { id: 0, element: 'O', position: [0, 0, 0], color: '#ff0000', radius: 0.6 },
            { id: 1, element: 'H', position: [0.76, 0.59, 0], color: '#ffffff', radius: 0.3 },
            { id: 2, element: 'H', position: [-0.76, 0.59, 0], color: '#ffffff', radius: 0.3 },
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
        ],
    },
    dna: {
        name: 'DNA Base Pair (A-T)',
        atoms: [
            // Adenine (simplified)
            { id: 0, element: 'N', position: [0, 0, 0], color: '#3050f8', radius: 0.5 },
            { id: 1, element: 'C', position: [1.2, 0.5, 0], color: '#909090', radius: 0.5 },
            { id: 2, element: 'C', position: [1.2, -0.5, 0], color: '#909090', radius: 0.5 },
            { id: 3, element: 'N', position: [2.4, 0, 0], color: '#3050f8', radius: 0.5 },
            { id: 4, element: 'C', position: [0, 1.2, 0], color: '#909090', radius: 0.5 },
            // Thymine (simplified)
            { id: 5, element: 'N', position: [0, 0, 3], color: '#3050f8', radius: 0.5 },
            { id: 6, element: 'C', position: [1.2, 0.5, 3], color: '#909090', radius: 0.5 },
            { id: 7, element: 'C', position: [1.2, -0.5, 3], color: '#909090', radius: 0.5 },
            { id: 8, element: 'O', position: [2.4, 0, 3], color: '#ff0000', radius: 0.5 },
            { id: 9, element: 'C', position: [0, 1.2, 3], color: '#909090', radius: 0.5 },
        ],
        bonds: [
            // Adenine bonds
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 0 },
            { from: 1, to: 3 },
            { from: 0, to: 4 },
            // Thymine bonds
            { from: 5, to: 6 },
            { from: 6, to: 7 },
            { from: 7, to: 5 },
            { from: 6, to: 8 },
            { from: 5, to: 9 },
            // Hydrogen bonds (A-T pairing)
            { from: 3, to: 8 },
            { from: 4, to: 9 },
        ],
    },
    methane: {
        name: 'Methane (CH₄)',
        atoms: [
            { id: 0, element: 'C', position: [0, 0, 0], color: '#909090', radius: 0.6 },
            { id: 1, element: 'H', position: [0.63, 0.63, 0.63], color: '#ffffff', radius: 0.3 },
            { id: 2, element: 'H', position: [-0.63, -0.63, 0.63], color: '#ffffff', radius: 0.3 },
            { id: 3, element: 'H', position: [-0.63, 0.63, -0.63], color: '#ffffff', radius: 0.3 },
            { id: 4, element: 'H', position: [0.63, -0.63, -0.63], color: '#ffffff', radius: 0.3 },
        ],
        bonds: [
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 0, to: 3 },
            { from: 0, to: 4 },
        ],
    },
};

const MoleculeMode = () => {
    const groupRef = useRef<THREE.Group>(null);
    const currentMolecule = useMemo(() => {
        return ['water', 'dna', 'methane'];
    }, []);
    const moleculeIndex = useRef(0);
    const molecule = MOLECULES[currentMolecule[moleculeIndex.current % currentMolecule.length]];

    useFrame((_state, _delta) => {
        const { rotation, scale, position } = useGestureStore.getState();

        if (groupRef.current) {
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation.x, 0.1);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation.y, 0.1);
            groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, scale * 3, 0.1));
            groupRef.current.position.lerp(new THREE.Vector3(position.x, position.y, position.z), 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            {/* Render Atoms */}
            {molecule.atoms.map((atom) => (
                <Sphere key={atom.id} args={[atom.radius, 32, 32]} position={atom.position}>
                    <meshStandardMaterial color={atom.color} metalness={0.3} roughness={0.4} />
                </Sphere>
            ))}

            {/* Render Bonds */}
            {molecule.bonds.map((bond, idx) => {
                const fromAtom = molecule.atoms.find((a) => a.id === bond.from);
                const toAtom = molecule.atoms.find((a) => a.id === bond.to);

                if (!fromAtom || !toAtom) return null;

                const from = new THREE.Vector3(...fromAtom.position);
                const to = new THREE.Vector3(...toAtom.position);
                const direction = new THREE.Vector3().subVectors(to, from);
                const length = direction.length();
                const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

                // Calculate rotation
                const axis = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(
                    axis,
                    direction.clone().normalize()
                );
                const euler = new THREE.Euler().setFromQuaternion(quaternion);

                return (
                    <Cylinder
                        key={idx}
                        args={[0.1, 0.1, length, 8]}
                        position={midpoint.toArray()}
                        rotation={[euler.x, euler.y, euler.z]}
                    >
                        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.5} />
                    </Cylinder>
                );
            })}

            {/* Info label */}
            <mesh position={[0, -3, 0]}>
                <planeGeometry args={[6, 1]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.7} />
            </mesh>
        </group>
    );
};

export default MoleculeMode;
