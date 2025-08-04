import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { easing } from 'maath'
import { useSnapshot } from 'valtio'
import { useFrame } from '@react-three/fiber'
import { Decal, useGLTF, useTexture } from '@react-three/drei'
import state from '../store'

// Preload and validate the model
useGLTF.preload('/pumpkin.glb', undefined, { 
  onProgress: (url, itemsLoaded, itemsTotal) => {
    console.log(`Loading model: ${itemsLoaded}/${itemsTotal}`);
  }
})

// Error boundary class
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Model Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )
    }

    return this.props.children
  }
}

const Pumpkin = () => {
  const snap = useSnapshot(state)
  const pumpkinRef = useRef()
  
  let nodes, materials;
  try {
    console.log('Attempting to load model...');
    const gltf = useGLTF('/pumpkin.glb', true); // true enables error logging
    console.log('GLTF loaded:', gltf);
    
    nodes = gltf.nodes;
    console.log('Full nodes object:', nodes);
    
    materials = gltf.materials;
    console.log('Full materials object:', materials);

    // Store the original material if it exists
    const originalMaterial = gltf.scene.children[0]?.material;
    if (originalMaterial) {
      console.log('Original material found:', originalMaterial);
      materials.defaultMaterial = originalMaterial.clone();
    }

    // Log all available properties in the model
    console.log('Model properties:', Object.keys(gltf));
    console.log('Scene children:', gltf.scene.children);

    if (!nodes || Object.keys(nodes).length === 0) {
      throw new Error('No nodes found in the model');
    }

    // Try to find any mesh in the nodes object
    const meshNode = Object.values(nodes).find(node => node.type === 'Mesh');
    if (!meshNode) {
      throw new Error('No mesh found in the model');
    }

    // Use the first available mesh if mesh_0 doesn't exist
    if (!nodes.mesh_0) {
      console.log('mesh_0 not found, using first available mesh:', meshNode.name);
      nodes.mesh_0 = meshNode;
    }

    if (!nodes.mesh_0?.geometry) {
      throw new Error('Mesh geometry not found in model');
    }
  } catch (error) {
    console.error('Detailed error loading model:', error);
    console.error('Stack trace:', error.stack);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    )
  }

  const logoTexture = useTexture(snap.frontLogoDecal)
  const fullTexture = useTexture(snap.fullDecal)
  const backLogoTexture = useTexture(snap.backLogoDecal)

  useFrame((state, delta) => {
    if (pumpkinRef.current) {
      const material = pumpkinRef.current.material;
      if (material && !snap.intro) { // Only change color when not in intro state
        if (materials.defaultMaterial && !snap.isCustomizing) {
          // Restore original material properties
          Object.assign(material, materials.defaultMaterial);
        } else {
          // Smoothly transition to selected color
          easing.dampC(material.color, snap.color, 0.25, delta);
        }
      }
    }
  })

  const stateString = JSON.stringify(snap)

  const createTextTexture = (text, font, size, color) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.font = `${size}px ${font}`
    const textWidth = ctx.measureText(text).width
    canvas.width = textWidth
    canvas.height = size
    ctx.fillStyle = color
    ctx.font = `${size}px ${font}`
    ctx.fillText(text, 0, size)
    return new THREE.CanvasTexture(canvas)
  }

  return (
    <group key={stateString}>
      <mesh
        ref={pumpkinRef}
        castShadow
        scale={[0.2, 0.2, 0.2]}  // Reduced scale to 0.2
        geometry={nodes.mesh_0.geometry}
        material={
          materials.defaultMaterial ? 
          materials.defaultMaterial :
          new THREE.MeshPhysicalMaterial({
            color: snap.intro ? '#ffffff' : snap.color, // Use white during intro, custom color when customizing
            roughness: 0.4,
            metalness: 0.1,
            clearcoat: 0.5,
            clearcoatRoughness: 0.3,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1,
          })
        }
      >
        {snap.isFullTexture && <Decal 
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
            map={fullTexture}
          />}
        
        {snap.isFrontLogoTexture && (
          <Decal
            position={snap.frontLogoPosition}
            rotation={[0, 0, 0]}
            scale={snap.frontLogoScale}
            map={logoTexture}
            toneMapped={false}
          />
        )}

        {snap.isBackLogoTexture && (
          <Decal
            position={snap.backLogoPosition}
            rotation={[0, 0, 0]}
            scale={snap.backLogoScale}
            map={backLogoTexture}
            toneMapped={false}
          />
        )}

        {snap.isFrontText && (
          <Decal
            position={snap.frontTextPosition}
            rotation={snap.frontTextRotation}
            scale={snap.frontTextScale}
            map={createTextTexture(
              snap.frontText,
              snap.frontTextFont,
              snap.frontTextSize || 32,
              snap.frontTextColor
            )}
            toneMapped={false}
          />
        )}

        {snap.isBackText && (
          <Decal
            position={snap.backTextPosition}
            rotation={snap.backTextRotation}
            scale={snap.backTextScale}
            map={createTextTexture(
              snap.backText,
              snap.backTextFont,
              snap.backTextSize || 32,
              snap.backTextColor
            )}
            toneMapped={false}
          />
        )}
      </mesh>
    </group>
  )
}

const WrappedPumpkin = () => {
  return (
    <ModelErrorBoundary>
      <Pumpkin />
    </ModelErrorBoundary>
  )
}

export default WrappedPumpkin
