import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PointCloud from './PointCloud';

const Scene = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-black" style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <PointCloud />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Scene;
