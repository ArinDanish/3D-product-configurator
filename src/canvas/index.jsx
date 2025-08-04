import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Center } from '@react-three/drei'
import Pumpkin from './Pumpkin'
import Backdrop from './Backdrop'
import CameraRig from './CameraRig'

const CanvasModel = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 2], fov: 35 }}
      gl={{ preserveDrawingBuffer: true }}
      className="w-full max-w-full h-full transition-all ease-in"
    >
      <ambientLight intensity={0.5} />
      <Environment preset="sunset" />

      <CameraRig>
        <Backdrop />
        <Center>
          <Pumpkin />
        </Center>
      </CameraRig>
    </Canvas>
  )
}

export default CanvasModel
