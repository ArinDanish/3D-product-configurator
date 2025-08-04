import { proxy } from 'valtio';

const state = proxy({
  intro: true,
  color: '#EFBD48',
  partColors: {}, // { partName: color }
  selectedPart: null, // currently selected mesh part
  allPartNames: [], // List of all mesh part names in the model
});

export default state;
