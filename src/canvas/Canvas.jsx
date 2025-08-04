import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Center, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Pumpkin from './Pumpkin'
import Backdrop from './Backdrop'
import CameraRig from './CameraRig'

const CanvasModel = () => {
  return (
    <div className="relative w-full h-full bg-white">
      <Canvas
        shadows={false}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 1], fov: 25 }}
        gl={{ 
          preserveDrawingBuffer: true,
          alpha: false,
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace
        }}
        className="w-full h-full transition-all ease-in"
      >
        <color attach="background" args={['#ffffff']} />
        <ambientLight intensity={1} />
        <directionalLight
          position={[5, 5, 5]}
          castShadow
          intensity={1}
          shadow-mapSize={1024}
          shadow-bias={-0.001}
        >
          <orthographicCamera attach="shadow-camera" args={[-10, 10, -10, 10]} />
        </directionalLight>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={1.5}
          minPolarAngle={Math.PI/4}
          maxPolarAngle={Math.PI*3/4}
          zoomSpeed={0.5}
          panSpeed={0.5}
          rotateSpeed={0.5}
        />
          <CameraRig>
            <Backdrop />
            <Center>
              <Suspense fallback={
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="lightgray" />
                </mesh>
              }>
                <Pumpkin />
              </Suspense>
            </Center>
          </CameraRig>
      </Canvas>

    </div>
  )
}

export default CanvasModel
