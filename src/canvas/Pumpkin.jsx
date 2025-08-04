import React from 'react';
import { easing } from 'maath';
import { useSnapshot } from 'valtio';
import { useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

import state from '../store';

const Pumpkin = () => {
  const snap = useSnapshot(state);
  const { scene } = useGLTF('/pumpkin.glb');
  
  // Log the loaded model structure
  React.useEffect(() => {
    console.log('Loaded Model:', scene);
    scene.traverse((child) => {
      if (child.isMesh) {
        console.log('Mesh found:', {
          name: child.name,
          material: child.material,
          geometry: child.geometry
        });
      }
    });
  }, [scene]);

  // Handle color updates
  useFrame((state, delta) => {
    scene.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        if (name.includes('body') && snap.bodyColor) {
          easing.dampC(child.material.color, snap.bodyColor, 0.25, delta);
        } else if (name.includes('eye') && snap.eyesColor) {
          easing.dampC(child.material.color, snap.eyesColor, 0.25, delta);
        } else if (name.includes('stem') && snap.stemColor) {
          easing.dampC(child.material.color, snap.stemColor, 0.25, delta);
        }
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[0, 5, 5]} 
        intensity={1} 
        castShadow 
      />
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={0.5}
      />

      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minPolarAngle={Math.PI/4}
        maxPolarAngle={Math.PI/2}
      />
      
      <primitive 
        object={scene} 
        scale={1}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      />
    </>
  );
}

export default Pumpkin;
