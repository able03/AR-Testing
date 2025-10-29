# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AR furniture customization application built with React, Three.js, and WebXR. Users can customize multiple furniture pieces (color, texture, scale, rotation) in a 3D preview environment, then view and manipulate them in augmented reality.

## Development Commands

- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Core Architecture

### Application Flow

The app has two distinct modes managed by `App.jsx`:

1. **Customization Mode** (`MultipleFurnitureCustomization.jsx`): Users add furniture models, customize their appearance (color, texture, scale, rotation), and manipulate them in a Three.js canvas using TransformControls.

2. **AR Mode** (`ARViewer.jsx`): Users enter WebXR AR session where furniture pieces are rendered in real space. Furniture can be selected, moved, rotated, and deleted using TransformControls in the AR environment.

State flows from App.jsx down to both modes, ensuring furniture configurations persist when switching between modes.

### Key Components

- **App.jsx**: Root component managing furniture state array and mode switching (customization vs AR)
- **MultipleFurnitureCustomization.jsx**: 3D preview canvas with furniture management (add, select, transform, customize)
- **ARViewer.jsx**: WebXR AR session with interactive furniture placement and manipulation
- **Model.jsx**: Reusable 3D model loader using `@react-three/drei`'s `useGLTF`. Applies color and texture materials to all meshes in loaded GLTF models
- **ModelViewer.jsx**: Simple 3D viewer component (appears to be legacy/unused)

### Furniture Data Structure

Each furniture object in the state array contains:
```javascript
{
  id: number,              // Unique timestamp-based ID
  path: string,            // Path to GLTF model in /public
  position: [x, y, z],     // Three.js position vector
  rotation: [x, y, z],     // Three.js rotation (Euler angles)
  scale: [x, y, z],        // Uniform scaling
  color: string,           // Hex color applied to model material
  texturePath: string|null // Path to texture in /public/textures or null
}
```

### Three.js Integration

- Uses `@react-three/fiber` for declarative Three.js in React
- Uses `@react-three/drei` for helpers (OrbitControls, TransformControls, useGLTF, useTexture)
- Uses `@react-three/xr` for WebXR AR capabilities (ARButton, XR, Interactive)

### Material System

The `Model.jsx` component traverses GLTF scene graphs and replaces all mesh materials with `THREE.MeshStandardMaterial`, applying:
- User-selected color tint
- Optional texture map (wood, fabric, metal, or none)
- Fixed roughness (0.2) and metalness (0.2) values

**Important**: `useTexture` hook is called unconditionally with a fallback transparent pixel data URI to satisfy React's Rules of Hooks, then the texture is conditionally applied to the material.

### Transform Controls Pattern

Both customization and AR modes use TransformControls with a similar pattern:
1. User selects furniture by clicking (customization) or using Interactive component (AR)
2. TransformControls attaches to the selected object's scene node
3. `onObjectChange` callback updates furniture state with new position/rotation
4. Transform mode toggles between "translate" and "rotate"

## Asset Organization

- **/public/**: Static assets served directly
  - `*.glb`: GLTF 3D furniture models
  - `/textures/`: Material textures (wood.jpg, fabric.png, metal.png)

Available models hardcoded in `MultipleFurnitureCustomization.jsx:39-46`:
- 3d_wooden_cabinet.glb
- bunk_bed.glb
- liquor_cabinet.glb
- sofa.glb
- table_furniture.glb
- victorian_cabinet_double.glb

## Recent Enhancements (2025)

### 3D Customization Improvements
- **Responsive TransformControls**: Fixed clunky movement by using proper ref tracking for furniture groups
- **Collision Detection**: Optional collision detection system prevents furniture from overlapping (can be toggled)
- **Scale Mode**: Added scale transform mode alongside move and rotate
- **Delete Functionality**: Direct delete button in editing panel
- **OrbitControls Integration**: TransformControls now properly disable OrbitControls during dragging

### AR Mode Enhancements
- **Full In-AR Editing**: Add, customize, and delete furniture directly in AR space without exiting
- **Multiple Furniture Support**: Fixed rendering to display all furniture models (previously only showed one)
- **Model Size Normalization**: All models automatically normalized to consistent sizes regardless of source file dimensions
- **Enhanced UI**: Clean overlay controls with add/customize menus in AR
- **Transform Modes in AR**: Move, rotate, and scale furniture in AR space
- **iOS Compatibility**: Simplified AR session initialization to work properly on iOS Safari/ARKit devices

### Model System
- **Auto-normalization**: Models are automatically scaled to 1 unit based on largest dimension
- **Cloning**: Scene objects are cloned to prevent Three.js reference issues
- **Shadow Support**: All models cast and receive shadows

## Device Compatibility

### AR Requirements
- **Android**: Requires ARCore support (Android 7.0+, ARCore-capable device)
- **iOS**: Requires ARKit support (iOS 12+, iPhone 6S or newer)
- **Browsers**: Chrome 79+ (Android), Safari 13+ (iOS)

### Fallback Behavior
- ARButton component handles AR availability detection automatically
- Button only appears when WebXR AR is supported on device
- All furniture configurations persist when switching between modes

### Important Notes
- The `dom-overlay` feature is optional - iOS Safari may not support it
- ARButton from @react-three/xr has built-in detection, no custom detection needed
- Session initialization uses minimal required features for maximum compatibility

## Known Issues

Based on git history ("ar broken sizing", "fixed the crashing issue"):
- ~~AR sizing may have ongoing issues with model scale representation~~ **FIXED**: Auto-normalization implemented
- ~~Past texture/color selection crashes~~ **FIXED**: Unconditional hook calls and null checks implemented
- Transform collision detection is basic (bounding box based); complex geometries may have imperfect collision boundaries
