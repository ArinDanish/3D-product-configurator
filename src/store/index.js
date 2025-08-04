import { proxy } from 'valtio';

const state = proxy({
  intro: true,
  
  // Active part for color picking
  activePart: 'body',
  
  // Pumpkin colors - initially undefined to use original model colors
  bodyColor: undefined,
  eyesColor: undefined,
  stemColor: undefined,
  
  // Color presets
  bodyColorPresets: [
    '#ff6b00',  // Classic Orange
    '#ff4500',  // Deep Orange
    '#ffa500',  // Bright Orange
    '#ff8c00',  // Dark Orange
    '#ffffff',  // White (Ghost Pumpkin)
  ],
  eyesColorPresets: [
    '#000000',  // Black
    '#ff0000',  // Red
    '#ffff00',  // Yellow
    '#00ff00',  // Green
    '#ff8c00',  // Orange (for reverse effect)
  ],
  stemColorPresets: [
    '#2d5a27',  // Dark Green
    '#355e3b',  // Hunter Green
    '#228b22',  // Forest Green
    '#654321',  // Brown
    '#8b4513',  // Saddle Brown
  ],
});

export default state;
