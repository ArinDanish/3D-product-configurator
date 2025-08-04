import React from 'react'
import * as THREE from 'three'
import { easing } from 'maath'
import { useSnapshot } from 'valtio'
import { useFrame } from '@react-three/fiber'
import { Decal, useGLTF, useTexture } from '@react-three/drei'

import state from '../store'

const SoftToy = () => {
  const snap = useSnapshot(state)
  const { nodes, materials } = useGLTF('/soft_toy.glb')

  const logoTexture = useTexture(snap.frontLogoDecal)
  const fullTexture = useTexture(snap.fullDecal)
  const backLogoTexture = useTexture(snap.backLogoDecal)

  useFrame((state, delta) => {
    easing.dampC(materials.lambert1.color, snap.color, 0.25, delta)
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
        castShadow
        geometry={nodes.soft_toy.geometry}
        material={materials.lambert1}
        material-roughness={0.8} // Softer material appearance
        material-metalness={0.05} // Less metallic for plush toy look
        dispose={null}
      >
        {snap.isFullTexture && (
          <Decal
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
            map={fullTexture}
            depthTest={false}
            depthWrite={true}
          />
        )}

        {snap.isFrontLogoTexture && (
          <Decal
            position={snap.frontLogoPosition}
            rotation={[0, 0, 0]}
            scale={snap.frontLogoScale}
            map={logoTexture}
            map-anisotropy={16}
            depthTest={false}
            depthWrite={true}
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
          />
        )}

        {snap.isBackLogoTexture && (
          <Decal
            position={snap.backLogoPosition}
            rotation={snap.backLogoRotation}
            scale={snap.backLogoScale}
            map={backLogoTexture}
            map-anisotropy={16}
            depthTest={false}
            depthWrite={true}
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
          />
        )}
      </mesh>
    </group>
  )
}

export default SoftToy
