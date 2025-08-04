import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { easing } from 'maath'
import { useSnapshot } from 'valtio'
import { useLoader, useFrame } from '@react-three/fiber'
import { Decal, useGLTF, useTexture } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import state from '../store'

// Do not preload the model here - we'll load it dynamically

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
  const [error, setError] = useState(null)
  
  // Directly use the loader and handle promise explicitly
  const gltf = useLoader(
    GLTFLoader,
    './pumpkin.glb',
    undefined,
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
      console.error('An error happened during loading:', error)
      setError(error)
    }
  );
  
  // Debug log to check the model structure
  useEffect(() => {
    if (gltf && gltf.scene) {
      console.log("Full GLTF object:", gltf);
      
      // Log all the children in the scene
      console.log("Scene children:");
      gltf.scene.children.forEach((child, index) => {
        console.log(`Child ${index}:`, child.name, child.type, child);
      });
      
      // Process the model structure to identify meaningful parts
      const meshes = [];
      gltf.scene.traverse(object => {
        if (object.isMesh) {
          // Store original name
          object.userData.originalName = object.name;
          
          // Create a more meaningful name based on geometry, position, or color
          if (!object.name || object.name === '') {
            // Check if it has a material to identify by color
            if (object.material) {
              const color = object.material.color;
              
              // Identify parts based on material color and position
              if (color && color.getHexString) {
                const hexColor = color.getHexString().toLowerCase();
                
                // Green parts (stem and patches)
                if (hexColor.includes('00ff00') || hexColor.includes('00cc00') || 
                    hexColor.includes('33ff00') || hexColor.includes('99ff00')) {
                  if (object.position.y > 0.3) {
                    object.name = 'stem';
                  } else {
                    // Find which side the patch is on
                    const side = object.position.x > 0 ? 'right' : 'left';
                    object.name = `patch_${side}`;
                  }
                }
                // Orange/body parts
                else if (hexColor.includes('ff9900') || hexColor.includes('ff6600') || 
                         hexColor.includes('ff3300')) {
                  object.name = 'body';
                }
                // Feet/base parts
                else if (object.position.y < -0.3) {
                  const side = object.position.x > 0 ? 'right' : 'left';
                  object.name = `foot_${side}`;
                }
                // Face features (eyes, mouth)
                else if (object.position.z < -0.3) {
                  const height = object.position.y;
                  const side = object.position.x > 0 ? 'right' : 'left';
                  
                  if (height > 0.1) {
                    object.name = `eye_${side}`;
                  } else {
                    object.name = 'mouth';
                  }
                }
              }
            }
            
            // If still not identified by color, use position
            if (!object.name || object.name === '') {
              if (object.position.y > 0.5) {
                object.name = 'stem';
              } else if (object.position.y < -0.4) {
                object.name = 'base';
              } else {
                // Split the pumpkin body into segments based on position
                const angle = Math.atan2(object.position.z, object.position.x);
                const segment = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 8);
                object.name = `body_segment_${segment}`;
              }
            }
          }
          
          // If still no meaningful name, use a generic one
          if (!object.name || object.name === '') {
            object.name = `mesh_${object.id}`;
          }
          
          meshes.push(object.name);
          console.log(`Processed mesh: ${object.name} at position:`, object.position);
        }
      });
      
      // Store all part names in the global state for the UI
      state.allPartNames = meshes;
      
      console.log("All mesh parts:", meshes);
    }
  }, [gltf]);

  // If there was an error loading the model, show a red cube
  if (error) {
    console.error('Error loading model:', error);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    )
  }

  // Extract nodes and materials from the loaded model - ensure we have a consistent structure
  // Note: Depending on how the model was exported, nodes/materials might be defined differently
  const nodes = gltf.nodes || {};
  const materials = gltf.materials || {};
  
  // Log model information
  useEffect(() => {
    console.log('Model loaded successfully', gltf);
    console.log('Nodes:', nodes);
    console.log('Materials:', materials);
    
    // Analyze and log the structure of the model to understand its parts
    if (gltf.scene) {
      console.log('Scene structure:', gltf.scene);
      // Traverse through all mesh objects to log them
      gltf.scene.traverse(object => {
        if (object.isMesh) {
          console.log('Found mesh:', object.name, object);
          // Store a reference to original materials
          if (object.material) {
            object.userData.originalMaterial = object.material.clone();
          }
        }
      });
    }
  }, [gltf, nodes, materials])

  // Per-part color state and selection logic
  // Selected part name is stored in snap.selectedPart
  // Per-part colors are stored in snap.partColors (object: { partName: color })

  useFrame((state, delta) => {
    try {
      // Safely animate color transitions for all mesh parts
      if (!snap.intro && pumpkinRef.current) {
        // Reference to the actual model group
        const modelGroup = pumpkinRef.current;
        
        // Map to track which named parts we've processed
        const processedParts = new Map();
        
        // Color specific parts based on their categorization
        modelGroup.traverse((object) => {
          if (object.isMesh && object.material) {
            // Get the name - for the cartoon pumpkin this could be:
            // body, stem, left_patch, right_patch, left_foot, right_foot, eyes, mouth
            const partName = object.name;
            
            // Skip parts we've already processed (prevents duplicates)
            if (processedParts.has(partName)) return;
            processedParts.set(partName, true);
            
            // Get target color based on part name
            let targetColor;
            
            // Special case for "body" - if we have specific body part colors, use those
            if (partName === 'body' && snap.partColors?.['body']) {
              targetColor = snap.partColors['body'];
            }
            // Check if this specific part has a color defined
            else if (snap.partColors?.[partName]) {
              targetColor = snap.partColors[partName];
            } 
            // Use global color as fallback
            else {
              targetColor = snap.color;
            }
            
            // Highlight selected parts
            if (snap.selectedPart === partName) {
              // Make selected part slightly brighter
              const highlightColor = new THREE.Color(targetColor);
              highlightColor.offsetHSL(0, 0, 0.1);
              targetColor = highlightColor.getHex();
            }
            
            // Apply color with smooth transition
            if (object.material.color) {
              easing.dampC(object.material.color, targetColor, 0.25, delta);
            }
          }
        });
      }
    } catch (err) {
      console.error("Error animating colors:", err);
    }
  });

  const stateString = JSON.stringify(snap)

  // Modified approach: Clone the entire GLTF scene and set up the materials and click handlers
  if (!gltf || !gltf.scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    );
  }
  
  // Prepare the model with click handlers and materials
  const prepareModel = () => {
    // Clone the scene to avoid modifying the original
    const modelScene = gltf.scene.clone();
    
    // Define distinct parts of the pumpkin for better coloring
    // We'll try to identify main body, stem, and other parts
    const parts = {
      body: [],
      stem: null,
      base: null
    };
    
    // Set up each mesh in the model
    modelScene.traverse((object) => {
      if (object.isMesh) {
        // Enable shadows
        object.castShadow = true;
        object.receiveShadow = true;
        
        // Store original material properties for reference
        const origMaterial = object.material;
        const origColor = origMaterial.color ? origMaterial.color.clone() : new THREE.Color(0xffffff);
        
        // Remember the original color for potential reset
        object.userData.originalColor = origColor;
        
        // Create a new material for this part, preserving original properties when possible
        const partMaterial = new THREE.MeshStandardMaterial({
          color: snap.partColors?.[object.name] || snap.color,
          roughness: origMaterial.roughness !== undefined ? origMaterial.roughness : 0.4,
          metalness: origMaterial.metalness !== undefined ? origMaterial.metalness : 0.1,
          map: origMaterial.map || null,
          normalMap: origMaterial.normalMap || null,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 1,
          flatShading: false,
        });
        
        // Apply the material
        object.material = partMaterial;
        
        // Store the original geometry and material for reference
        object.userData.originalGeometry = object.geometry;
        object.userData.partName = object.name;
        
        // Make object interactive for part selection
        object.userData.clickHandler = (e) => {
          e.stopPropagation();
          // Set selected part in the state
          state.selectedPart = object.name;
          console.log("Selected part:", object.name);
        };
        
        // Categorize parts based on their name
        if (object.name.includes('stem')) {
          parts.stem = object;
        } else if (object.name.includes('base')) {
          parts.base = object;
        } else {
          parts.body.push(object);
        }
      }
    });
    
    console.log("Categorized parts:", parts);
    return modelScene;
  };
  
  // Create the prepared model
  const preparedModel = prepareModel();
  
  // Function to improve how we handle the specific cartoon pumpkin model
  const handleCartoonPumpkinModel = () => {
    // Try to identify the main parts of our cartoon pumpkin
    const mainBodyMesh = [];
    const stemMesh = [];
    const patchesMesh = [];
    const feetMesh = [];
    const faceMesh = [];
    
    // Find objects in the scene and categorize them
    gltf.scene.traverse((object) => {
      if (object.isMesh) {
        // Get material color to help identify parts
        let meshColor = null;
        if (object.material && object.material.color) {
          meshColor = '#' + object.material.color.getHexString();
        }
        
        console.log(`Mesh: ${object.name}, Color: ${meshColor}, Position:`, object.position);
        
        // Check position to identify parts
        const pos = object.position;
        
        // Classify based on position and color
        if (pos.y > 0.4) {
          // Stem (top part)
          object.name = 'stem';
          stemMesh.push(object);
        } else if (pos.y < -0.35) {
          // Feet (bottom part)
          const side = pos.x > 0 ? 'right_foot' : 'left_foot';
          object.name = side;
          feetMesh.push(object);
        } else if (pos.z < -0.35) {
          // Face (front part)
          if (pos.y > 0) {
            const side = pos.x > 0 ? 'right_eye' : 'left_eye';
            object.name = side;
          } else {
            object.name = 'mouth';
          }
          faceMesh.push(object);
        } else if (meshColor && (
            meshColor.includes('00ff00') || 
            meshColor.includes('00cc00') || 
            meshColor.includes('33ff00') ||
            meshColor.toLowerCase() === '#89fc00')) {
          // Green patches
          const side = pos.x > 0 ? 'right_patch' : 'left_patch';
          object.name = side;
          patchesMesh.push(object);
        } else {
          // Main body (orange parts)
          object.name = 'body';
          mainBodyMesh.push(object);
        }
      }
    });
    
    console.log("Identified parts:", {
      body: mainBodyMesh.length,
      stem: stemMesh.length,
      patches: patchesMesh.length,
      feet: feetMesh.length,
      face: faceMesh.length
    });
    
    // Store names in the state for UI
    state.allPartNames = [
      'body', 'stem', 'left_patch', 'right_patch', 
      'left_foot', 'right_foot', 'left_eye', 'right_eye', 'mouth'
    ];
  };
  
  // Run this function to process our model
  useEffect(() => {
    if (gltf && gltf.scene) {
      handleCartoonPumpkinModel();
    }
  }, [gltf]);
  
  // Create a ray-based click detector to improve part selection
  const detectClickedPart = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Direct hit detection
    if (e.object && e.object.userData && e.object.userData.clickHandler) {
      e.object.userData.clickHandler(e);
      return;
    }
    
    console.log("Clicked object:", e.object);
    
    // For the cartoon pumpkin, check if we can determine what part was clicked
    // by the object's position or material color
    if (e.object && e.object.isMesh) {
      const pos = e.object.position;
      let partName = null;
      
      if (pos.y > 0.4) {
        partName = 'stem';
      } else if (pos.y < -0.35) {
        partName = pos.x > 0 ? 'right_foot' : 'left_foot';
      } else if (pos.z < -0.35) {
        if (pos.y > 0) {
          partName = pos.x > 0 ? 'right_eye' : 'left_eye';
        } else {
          partName = 'mouth';
        }
      } else if (e.object.material && e.object.material.color) {
        // Check if it's a green patch
        const color = '#' + e.object.material.color.getHexString();
        if (color.includes('00ff00') || color.includes('33ff00')) {
          partName = pos.x > 0 ? 'right_patch' : 'left_patch';
        }
      }
      
      if (partName) {
        state.selectedPart = partName;
        console.log("Selected part:", partName);
        return;
      }
    }
    
    // Default to body if no specific part detected
    state.selectedPart = "body";
  };

  return (
    <primitive 
      ref={pumpkinRef}
      object={preparedModel} 
      scale={[0.2, 0.2, 0.2]} 
      key={stateString}
      onClick={detectClickedPart}
      onPointerMissed={() => {
        // When clicking away from model, deselect current part
        state.selectedPart = null;
      }}
    />
  )
}

// Color picker UI has been moved to src/components/PartColorPicker.jsx

const WrappedPumpkin = () => {
  return (
    <ModelErrorBoundary>
      <Pumpkin />
    </ModelErrorBoundary>
  );
};

export default WrappedPumpkin;
