import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import { useSnapshot } from 'valtio';
import state from '../store';

const CameraRig = ({ children }) => {
  const group = useRef();
  const snap = useSnapshot(state);
  const { camera } = useThree();

  // Set up interactive rotation and camera positioning
  useFrame((state, delta) => {
    const isBreakpoint = window.innerWidth <= 1260;
    const isMobile = window.innerWidth <= 600;

    // Set the initial position of the model
    let targetPosition = [-0.4, 0, 2];
    if(snap.intro) {
      if(isBreakpoint) targetPosition = [0, 0, 2];
      if(isMobile) targetPosition = [0, 0.2, 2.5];
    } else {
      if(isMobile) targetPosition = [0, 0, 2.5]
      else targetPosition = [0, 0, 2];
    }

    // Set model camera position with smooth damping
    easing.damp3(camera.position, targetPosition, 0.25, delta);

    // Set the model rotation smoothly based on mouse position
    if (group.current) {
      if (snap.intro) {
        // In intro mode, auto-rotate slowly for showcase
        group.current.rotation.y += delta * 0.2;
      } else if (snap.selectedPart) {
        // When part is selected, stop rotation for easier editing
        easing.dampE(
          group.current.rotation,
          [state.pointer.y / 20, -state.pointer.x / 10, 0],
          0.05, // Very slow movement
          delta
        );
      } else {
        // Normal rotation - follow mouse but not too quickly
        easing.dampE(
          group.current.rotation,
          [state.pointer.y / 15, -state.pointer.x / 7, 0],
          0.15,
          delta
        );
      }
    }
  });

  return <group ref={group}>{children}</group>;
};

export default CameraRig;
