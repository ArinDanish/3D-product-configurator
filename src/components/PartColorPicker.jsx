import React from 'react';
import { HexColorPicker } from "react-colorful";
import { useSnapshot } from 'valtio';
import state from '../store';

// UI for per-part color picker - rendered outside R3F tree
export const PartColorPicker = () => {
  const snap = useSnapshot(state);
  
  // Common styles for the panel
  const panelStyle = {
    position: 'absolute', 
    top: 20, 
    right: 20, 
    zIndex: 10, 
    background: '#fff', 
    padding: 12, 
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '220px'
  };
  
  // Button styles
  const buttonStyle = {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: 'white'
  };
  
  // Define part categories for our cartoon pumpkin
  const partCategories = {
    'Body': ['body'],
    'Stem': ['stem'],
    'Patches': ['left_patch', 'right_patch'],
    'Feet': ['left_foot', 'right_foot'],
    'Face': ['left_eye', 'right_eye', 'mouth']
  };
  
  // Get friendly name for a part
  const getFriendlyPartName = (partName) => {
    // Map technical names to user-friendly names
    const nameMap = {
      'body': 'Body',
      'stem': 'Stem',
      'left_patch': 'Left Patch',
      'right_patch': 'Right Patch',
      'left_foot': 'Left Foot',
      'right_foot': 'Right Foot',
      'left_eye': 'Left Eye',
      'right_eye': 'Right Eye',
      'mouth': 'Mouth'
    };
    
    return nameMap[partName] || partName;
  };
  
  // Quick select buttons for the cartoon pumpkin parts
  const QuickSelectButtons = () => {
    return (
      <div style={{ marginTop: '15px', marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Quick Select:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
          {Object.entries(partCategories).map(([category, parts]) => (
            <button 
              key={category}
              onClick={() => { state.selectedPart = parts[0]; }}
              style={{ 
                padding: '5px', 
                background: '#e0e0e0', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Show a message to click on the model if no part is selected
  if (!snap.intro && !snap.selectedPart) {
    return (
      <div style={panelStyle}>
        <div style={{fontWeight: 'bold', marginBottom: '10px'}}>3D Pumpkin Configurator</div>
        <div style={{marginBottom: '10px'}}>Click on any part of the pumpkin to select it for coloring</div>
        
        <QuickSelectButtons />
        
        <div style={{ marginTop: 12 }}>
          <div style={{marginBottom: '5px'}}>Global Color:</div>
          <HexColorPicker
            color={snap.color}
            onChange={color => {
              state.color = color;
            }}
          />
          <div style={{textAlign: 'center', marginTop: '10px', color: '#666', fontSize: '12px'}}>
            This color will be applied to all parts without specific colors
          </div>
        </div>
      </div>
    );
  }
  
  // Show part-specific color picker when a part is selected
  if (snap.selectedPart) {
    // Find which category this part belongs to
    let currentCategory = "Other";
    for (const [category, parts] of Object.entries(partCategories)) {
      if (parts.includes(snap.selectedPart)) {
        currentCategory = category;
        break;
      }
    }
    
    return (
      <div style={panelStyle}>
        <div style={{ marginBottom: 5, fontWeight: 'bold' }}>
          Selected: <span style={{color: '#0066cc'}}>{getFriendlyPartName(snap.selectedPart)}</span>
        </div>
        <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
          Category: {currentCategory}
        </div>
        
        <HexColorPicker
          color={snap.partColors?.[snap.selectedPart] || snap.color}
          onChange={color => {
            state.partColors = { ...snap.partColors, [snap.selectedPart]: color };
          }}
        />
        
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
          <button 
            style={{ ...buttonStyle, backgroundColor: '#f44336' }} 
            onClick={() => { 
              const newPartColors = {...snap.partColors};
              delete newPartColors[snap.selectedPart];
              state.partColors = newPartColors;
            }}
          >
            Reset Color
          </button>
          <button 
            style={{ ...buttonStyle, backgroundColor: '#2196f3' }} 
            onClick={() => { state.selectedPart = null; }}
          >
            Done
          </button>
        </div>
        
        {/* Category coloring options */}
        <div style={{marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px'}}>
          <div style={{marginBottom: '5px', fontWeight: 'bold'}}>Apply to:</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px'}}>
            {/* Apply to category button */}
            {currentCategory !== "Other" && (
              <button 
                style={{ ...buttonStyle, backgroundColor: '#9C27B0', fontSize: '12px', padding: '6px' }} 
                onClick={() => {
                  const newPartColors = {...snap.partColors};
                  const currentColor = snap.partColors?.[snap.selectedPart] || snap.color;
                  
                  // Apply to all parts in this category
                  partCategories[currentCategory].forEach(partName => {
                    newPartColors[partName] = currentColor;
                  });
                  
                  state.partColors = newPartColors;
                }}
              >
                All {currentCategory}
              </button>
            )}
            
            {/* Apply to all button */}
            <button 
              style={{ ...buttonStyle, backgroundColor: '#4CAF50', fontSize: '12px', padding: '6px' }} 
              onClick={() => {
                // Apply this color to all parts
                if (state.allPartNames && state.allPartNames.length) {
                  const newPartColors = {...snap.partColors};
                  const currentColor = snap.partColors?.[snap.selectedPart] || snap.color;
                  
                  state.allPartNames.forEach(partName => {
                    newPartColors[partName] = currentColor;
                  });
                  
                  state.partColors = newPartColors;
                } else {
                  state.color = snap.partColors?.[snap.selectedPart] || snap.color;
                }
              }}
            >
              Entire Pumpkin
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};
