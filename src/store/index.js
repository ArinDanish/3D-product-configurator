import { proxy } from 'valtio';

const state = proxy({
  intro: true,
  color: '#EFBD48',
  isFullTexture: false,
  isFrontLogoTexture: false,
  isBackLogoTexture: false,
  isFrontText: false,
  isBackText: false,
  frontLogoDecal: './threejs.png',
  backLogoDecal: './threejs.png',
  fullDecal: './threejs.png',
  frontLogoPosition: [0, 0, 0],
  frontLogoScale: 0.15,
  backLogoPosition: [0, 0, 0],
  backLogoScale: 0.15,
  frontText: '',
  frontTextPosition: [0, 0, 0],
  frontTextRotation: [0, 0, 0],
  frontTextScale: [0.1, 0.1, 0.1],
  frontTextFont: 'Arial',
  frontTextColor: '#000000',
  backText: '',
  backTextPosition: [0, 0, 0],
  backTextRotation: [0, 0, 0],
  backTextScale: [0.1, 0.1, 0.1],
  backTextFont: 'Arial',
  backTextColor: '#000000'
});

export default state;
