import Cube from "./Cube";
import { useState } from "react";
import ModelViewer from "./ModelViewer";
import ARViewer from "./ARViewer";
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";

function Customization(){
    const [color, setColor] = useState("pink");
    const [height, setHeight] = useState(2);
    const [width, setWidth] = useState(2);
    const [depth, setDepth] = useState(2);
    const [texture, setTexture] = useState("/aba.webp");
    const [modelTexture, setModelTexture] = useState("/textures/wood.jpg");
    const [model, setModel] = useState("/sofa.glb");

    const [exportedModel, setExportedModel] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    
    const handleExportToAR = async () => {
        setIsExporting(true);
        try {
          const loader = new GLTFLoader();
          const loadedModel = await new Promise((resolve, reject) =>
            loader.load(model, resolve, undefined, reject)
          );
      
          // Clone the loaded model
          const cloned = loadedModel.scene.clone(true);
      
          // Load texture if provided and convert to data URL
          let textureToUse = null;
          if (modelTexture) {
            try {
              const textureLoader = new THREE.TextureLoader();
              const loadedTexture = await new Promise((resolve, reject) => {
                textureLoader.load(
                  modelTexture,
                  (tex) => {
                    // Convert texture to canvas data URL
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = tex.image;
                    
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Create new texture from data URL
                    const dataURL = canvas.toDataURL('image/png');
                    const newTexture = textureLoader.load(dataURL);
                    newTexture.wrapS = tex.wrapS;
                    newTexture.wrapT = tex.wrapT;
                    newTexture.minFilter = THREE.LinearFilter;
                    newTexture.magFilter = THREE.LinearFilter;
                    resolve(newTexture);
                  },
                  undefined,
                  (err) => {
                    console.warn('Texture loading failed:', err);
                    resolve(null);
                  }
                );
              });
              textureToUse = loadedTexture;
              
              // Wait for texture to be ready
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (err) {
              console.warn('Could not process texture:', err);
            }
          }
      
          // Apply customizations with texture
          cloned.traverse((child) => {
            if (child.isMesh) {
              // Create material with texture if available
              child.material = new THREE.MeshStandardMaterial({
                color: color || "#ffffff",
                map: textureToUse,
                roughness: 0.5,
                metalness: 0.3,
              });
              child.material.needsUpdate = true;
            }
          });
      
          // Apply scale
          cloned.scale.set(width, height, depth);
      
          // Use dynamic import for GLTFExporter to avoid issues
          const { GLTFExporter } = await import('three-stdlib');
          const exporter = new GLTFExporter();
          
          exporter.parse(
            cloned,
            (result) => {
              let output;
              if (result instanceof ArrayBuffer) {
                output = result;
              } else {
                const json = JSON.stringify(result, null, 2);
                output = new TextEncoder().encode(json);
              }
      
              const blob = new Blob([output], {
                type: "model/gltf-binary",
              });
              const url = URL.createObjectURL(blob);
              
              // Clean up old URL if exists
              if (exportedModel) {
                URL.revokeObjectURL(exportedModel);
              }
              
              setExportedModel(url);
              console.log("Exported for AR:", url);
              setIsExporting(false);
            },
            (error) => {
              console.error("Export error:", error);
              setIsExporting(false);
            },
            { 
              binary: true,
              onlyVisible: true,
              embedImages: false,
              truncateDrawRange: false,
            }
          );
        } catch (err) {
          console.error("Export failed:", err);
          setIsExporting(false);
        }
      };

    return(
        <>
            {/* Main Model Viewer */}
            <ModelViewer
                color={color}
                width={width}
                height={height}
                depth={depth}
                texturePath={modelTexture}
                modelPath={model}
            />

            {/* Export to AR Button */}
            <button 
                className="btn" 
                onClick={handleExportToAR}
                disabled={isExporting}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    marginTop: '20px',
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                    opacity: isExporting ? 0.5 : 1
                }}
            >
                {isExporting ? 'Preparing AR...' : 'View in AR'}
            </button>

            {/* AR Preview */}
            {exportedModel && <ARViewer glbPath={exportedModel} />}

            {/* Cube Preview (optional) */}
            {/* <Cube 
                color={color} 
                height={height} 
                width={width} 
                depth={depth} 
                texture={texture}
            /> */}

            {/* Colors */}
            <div style={{ margin: '20px 0' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Colors</div>
                <button className="btn" onClick={() => setColor("red")}>Red</button>
                <button className="btn" onClick={() => setColor("blue")}>Blue</button>
                <button className="btn" onClick={() => setColor("pink")}>Pink</button>
                <button className="btn" onClick={() => setColor("white")}>White</button>
                <button className="btn" onClick={() => setColor("green")}>Green</button>
                <button className="btn" onClick={() => setColor("orange")}>Orange</button>
            </div>

            {/* Textures for Cube */}
            {/* <div style={{ margin: '20px 0' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Cube Textures</div>
                <button className="btn" onClick={() => setTexture("/aba.webp")}>Wood</button>
                <button className="btn" onClick={() => setTexture("/cotton.webp")}>Flowers</button>
                <button className="btn" onClick={() => setTexture("/cotton 2.webp")}>Group</button>
            </div> */}

            {/* Dimensions */}
            <div style={{ margin: '20px 0' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Dimensions</div>
                <div>
                    <label htmlFor="width">Width: {width.toFixed(1)}</label>
                    <input 
                        id="width" 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.1" 
                        value={width}
                        onChange={(e) => setWidth(parseFloat(e.target.value))}
                        style={{ width: '200px', marginLeft: '10px' }}
                    />
                </div>
                <div>
                    <label htmlFor="height">Height: {height.toFixed(1)}</label>
                    <input 
                        id="height" 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.1" 
                        value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value))}
                        style={{ width: '200px', marginLeft: '10px' }}
                    />
                </div>
                <div>
                    <label htmlFor="depth">Depth: {depth.toFixed(1)}</label>
                    <input 
                        id="depth" 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.1" 
                        value={depth}
                        onChange={(e) => setDepth(parseFloat(e.target.value))}
                        style={{ width: '200px', marginLeft: '10px' }}
                    />
                </div>
            </div>

            {/* Model Textures */}
            <div style={{ margin: '20px 0' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Model Textures (Preview Only - Not in AR)</div>
                <button className="btn" onClick={() => setModelTexture("/textures/fabric.png")}>Fabric</button>
                <button className="btn" onClick={() => setModelTexture("/textures/metal.png")}>Metal</button>
                <button className="btn" onClick={() => setModelTexture("/textures/wood.jpg")}>Wood</button>
                <button className="btn" onClick={() => setModelTexture(null)}>None</button>
            </div>

            {/* Models */}
            <div style={{ margin: '20px 0' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Select Model</div>
                <button className="btn" onClick={() => setModel("/table_furniture.glb")}>Table Furniture</button>
                <button className="btn" onClick={() => setModel("/bunk_bed.glb")}>Bunk Bed</button>
                <button className="btn" onClick={() => setModel("/sofa.glb")}>L-Shape Sofa</button>
                <button className="btn" onClick={() => setModel("/3d_wooden_cabinet.glb")}>3D Wooden Cabinet</button>
                <button className="btn" onClick={() => setModel("/liquor_cabinet.glb")}>Liquor Cabinet</button>
                <button className="btn" onClick={() => setModel("/victorian_cabinet_double.glb")}>Victorian Cabinet Double</button>
            </div>

            <style>{`
                .btn {
                    padding: 8px 16px;
                    margin: 5px;
                    border: none;
                    border-radius: 5px;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                }
                .btn:hover {
                    background-color: #0056b3;
                }
                .btn:active {
                    background-color: #004085;
                }
            `}</style>
        </>
    )
}

export default Customization;