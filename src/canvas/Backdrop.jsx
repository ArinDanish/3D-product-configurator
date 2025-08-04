// 
import React from 'react'

const Backdrop = () => (
  <group>
    {/* Ground */}
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial color="white" />
    </mesh>

    {/* Backdrop */}
    <mesh
      position={[0, 2, -10]}
      castShadow={false}
      receiveShadow={false}
      renderOrder={-1}
    >
      <planeGeometry args={[10, 5]} />
      <meshBasicMaterial color="white" />
    </mesh>
  </group>
)

export default Backdrop
