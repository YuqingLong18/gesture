import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PointCloud from './PointCloud';

const Scene = () => {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
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
