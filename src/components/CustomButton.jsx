import React from 'react'

const CustomButton = ({ type, title, customStyles, handleClick }) => {
  return (
    <button
      className={`px-4 py-2.5 font-bold text-sm ${customStyles}`}
      type={type}
      onClick={handleClick}
    >
      {title}
    </button>
  )
}

export default CustomButton
