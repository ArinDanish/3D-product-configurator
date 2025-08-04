import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSnapshot } from 'valtio'

import config from '../config/config'
import state from '../store'
import { download } from '../assets'
import { downloadCanvasToImage, reader } from '../config/helpers'
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants'
import { fadeAnimation, slideAnimation } from '../config/motion'
import { ColorPicker, FilePicker, Tab, TextureLogoPicker } from '../components'
import { TextControls, LogoControls } from '../canvas/index.js'

const Customizer = () => {
  const snap = useSnapshot(state)
  
  const [file, setFile] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generatingImg, setGeneratingImg] = useState(false)
  const [activeEditorTab, setActiveEditorTab] = useState("")
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoControls: false,
    textControls: false
  })

  // show tab content depending on the activeTab
  const generateTabContent = () => {
    switch (activeEditorTab) {
      case "colorpicker":
        return <ColorPicker />
      case "filepicker":
        return <FilePicker
          file={file}
          setFile={setFile}
          readFile={readFile}
        />
      case "texturelogopicker":
        return <TextureLogoPicker 
          texturesLogos={DecalTypes}
          handleTextureLogoClick={handleTextureLogoClick}
        />
      default:
        return null
    }
  }

  const handleTextureLogoClick = (item) => {
    if (item.type === 'texture') {
      state.isFullTexture = !state.isFullTexture
      if (state.isFullTexture) state.fullDecal = item.image
    } else if (item.type === 'frontLogo') {
      state.isFrontLogoTexture = !state.isFrontLogoTexture
      if (state.isFrontLogoTexture) state.frontLogoDecal = item.image
    } else if (item.type === 'backLogo') {
      state.isBackLogoTexture = !state.isBackLogoTexture
      if (state.isBackLogoTexture) state.backLogoDecal = item.image
    }
  }

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case "logoControls":
        state.isFrontText = false
        state.isBackText = false
        setActiveFilterTab(prevState => ({
          ...prevState,
          [tabName]: !prevState[tabName],
          textControls: false
        }))
        break
      case "textControls":
        setActiveFilterTab(prevState => ({
          ...prevState,
          [tabName]: !prevState[tabName],
          logoControls: false
        }))
        break
      default:
        setActiveFilterTab(prevState => ({ ...prevState, [tabName]: !prevState[tabName] }))
        break
    }
  }

  const readFile = (type) => {
    reader(file)
      .then((result) => {
        if (type === "logo") {
          state.frontLogoDecal = result
          state.isFrontLogoTexture = true
        } else {
          state.fullDecal = result
          state.isFullTexture = true
        }
      })
  }

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation('left')}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => setActiveEditorTab(tab.name)}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute z-10 top-5 right-5"
            {...fadeAnimation}
          >
            <button className='download-btn' onClick={downloadCanvasToImage}>
              <img
                src={download}
                alt="download_image"
                className="w-3/5 h-3/5 object-contain"
              />
            </button>
          </motion.div>

          <motion.div
            className='filtertabs-container'
            {...slideAnimation("up")}
          >
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFilterTab(tab.name)}
              />
            ))}

            {/* Logo Position Controls */}
            {activeFilterTab.logoControls && <LogoControls />}

            {/* Text Controls */}
            {activeFilterTab.textControls && <TextControls />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Customizer
