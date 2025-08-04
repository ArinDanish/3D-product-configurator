import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber'
import { Center } from '@react-three/drei';
import Pumpkin from './Pumpkin';
import CameraRig from './CameraRig';

const CanvasModel = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 2], fov: 45 }}
      gl={{ preserveDrawingBuffer: true }}
      className="w-full max-w-full h-full transition-all ease-in"
      shadows
    >
      <color attach="background" args={['#f0f0f0']} />
      <fog attach="fog" args={['#f0f0f0', 10, 20]} />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[1, 2, 3]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />

      <CameraRig>
        <Center>
          <Suspense fallback={null}>
            <Pumpkin />
          </Suspense>
        </Center>
      </CameraRig>
    </Canvas>
  )
}

export default CanvasModel