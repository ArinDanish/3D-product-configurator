import React from 'react'
import { useSnapshot } from 'valtio';

import state from '../store';
import { getContrastingColor } from '../config/helpers';

const CustomButton = ({ type, title, customStyles, handleClick }) => {
  const snap = useSnapshot(state);

  const generateStyle = (type) => {
    const defaultColor = '#ff6b00'; // Default pumpkin color
    const buttonColor = snap.bodyColor || defaultColor;

    if(type === 'filled') {
      return {
        backgroundColor: buttonColor,
        color: getContrastingColor(buttonColor)
      }
    } else if(type === "outline") {
      return {
        borderWidth: '1px',
        borderColor: buttonColor,
        color: buttonColor
      }
    }
  }

  return (
    <button
      className={`px-2 py-1.5 flex-1 rounded-md ${customStyles}`}
      style={generateStyle(type)}
      onClick={handleClick}
    >
      {title}
    </button>
  )
}

export default CustomButton