import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGestureStore } from '../store';
import VisualizerMode from './modes/VisualizerMode';
// Import other modes as they are created
import MoleculeMode from './modes/MoleculeMode';
import GravityMode from './modes/GravityMode';
import MathMode from './modes/MathMode';
import SolarMode from './modes/SolarMode';

const Scene = () => {
  const mode = useGestureStore((state) => state.mode);

  return (
    <div className="absolute inset-0 w-full h-full bg-black z-0" style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {mode === 'visualizer' && <VisualizerMode />}
        {mode === 'molecule' && <MoleculeMode />}
        {mode === 'gravity' && <GravityMode />}
        {mode === 'math' && <MathMode />}
        {mode === 'solar' && <SolarMode />}

        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Scene;
