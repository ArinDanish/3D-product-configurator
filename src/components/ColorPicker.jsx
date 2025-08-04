import React from 'react'
import { SketchPicker } from 'react-color'
import { useSnapshot } from 'valtio'

import state from '../store'

const ColorPicker = ({ part }) => {
  const snap = useSnapshot(state)

  const getColor = () => {
    switch(part) {
      case 'body':
        return snap.bodyColor
      case 'eyes':
        return snap.eyesColor
      case 'stem':
        return snap.stemColor
      default:
        return '#ffffff'
    }
  }

  const getPresets = () => {
    switch(part) {
      case 'body':
        return snap.bodyColorPresets
      case 'eyes':
        return snap.eyesColorPresets
      case 'stem':
        return snap.stemColorPresets
      default:
        return []
    }
  }

  const updateColor = (color) => {
    const { hex } = color

    switch(part) {
      case 'body':
        state.bodyColor = hex
        break
      case 'eyes':
        state.eyesColor = hex
        break
      case 'stem':
        state.stemColor = hex
        break
      default:
        break
    }
  }

  return (
    <div className="absolute left-full ml-3">
      <SketchPicker 
        color={getColor()}
        presetColors={getPresets()}
        disableAlpha
        onChange={updateColor}
      />
    </div>
  )
}

export default ColorPicker