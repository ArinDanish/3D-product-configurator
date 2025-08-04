import { swatch, fileIcon, logoControls, textIcon, textureLogoPicker } from "../assets";
import { texture1, texture2, texture3, texture4, texture5, logo1, logo2 } from "../assets";

export const EditorTabs = [
  {
    name: "colorpicker",
    icon: swatch,
  },
  {
    name: "filepicker",
    icon: fileIcon,
  },
  {
    name: "texturelogopicker",
    icon: textureLogoPicker,
  },
];

export const FilterTabs = [
  {
    name: "logoControls",
    icon: logoControls,
  },
  {
    name: "textControls",
    icon: textIcon,
  },
];

export const DecalTypes = [
  {
    name: 'texture1',
    type: 'texture',
    image: texture1,
  },
  {
    name: 'texture2',
    type: 'texture',
    image: texture2,
  },
  {
    name: 'texture3',
    type: 'texture',
    image: texture3,
  },
  {
    name: 'texture4',
    type: 'texture',
    image: texture4,
  },
  {
    name: 'texture5',
    type: 'texture',
    image: texture5,
  },
  {
    name: 'logo1',
    type: 'frontLogo',
    image: logo1,
  },
  {
    name: 'logo2',
    type: 'frontLogo',
    image: logo2,
  },
  {
    name: 'logo1',
    type: 'backLogo',
    image: logo1,
  },
  {
    name: 'logo2',
    type: 'backLogo',
    image: logo2,
  },
];
