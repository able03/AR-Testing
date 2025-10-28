import {Canvas} from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { useState, useRef } from "react";
import  Model  from "./Model";


function MultipleFurnitureCustomization({ furnitures, setFurnitures, onViewInAR }){
    const [selectedId, setSelectedId] = useState(null);
    const transformRef = useRef();

    const availableModels = [
        { name: "Wooden Cabinet", path: "/3d_wooden_cabinet.glb" },
        { name: "Bunk Bed", path: "/bunk_bed.glb" },
        { name: "Liquor Cabiner", path: "/liquor_cabinet.glb" },
        { name: "Sofa", path: "/sofa.glb" },
        { name: "Table Furniture", path: "table_furniture.glb" },
        { name: "Victorian Cabinet Double", path: "victorian_cabinet_double" }
    ]

    const handleAddModel = (model) => {
        const id = Date.now();
        setFurnitures((prev) => [
            ...prev,
            {
                id,
                path: model.path,
                position: [Math.random() * 4-2, 0, Math.random() * 4-2],
                rotation: [0,0,0],
                scale: [1,1,1],
                color: "#ffffff",
            },
        ]);    
    };

    const handleSelect = (id) => setSelectedId(id);
    const selectedFurniture = furnitures.find((f) => f.id === selectedId);

    const handleUpdate = (id, updatedProps) => {
        setFurnitures((prev) => 
            prev.map((f) => (f.id === id ? {...f, ...updatedProps} : f))
        );
    };

    return(
        <>
            <h2>Multiple Furniture Customization</h2>

            <div style={{marginBottom: "10px"}}>
                {availableModels.map((m) => (
                    <button key={m.name} onClick={() => handleAddModel(m)}>
                        Add {m.name}
                    </button>
                ))}
            </div>

 {/* Editing Panel */}
 {selectedFurniture && (
        <div
          style={{
            padding: "10px",
            border: "1px solid #aaa",
            marginBottom: "10px",
            background: "#f8f8f8",
            borderRadius: "8px",
          }}
        >
          <h3>Editing: {selectedFurniture.path.split("/").pop()}</h3>
          <div>
            <label>Color: </label>
            <input
              type="color"
              value={selectedFurniture.color}
              onChange={(e) =>
                handleUpdate(selectedId, { color: e.target.value })
              }
            />
          </div>
          <div>
            <label>Texture: </label>
            <button
              onClick={() =>
                handleUpdate(selectedId, { texturePath: "/textures/wood.jpg" })
              }
            >
              Wood
            </button>
            <button
              onClick={() =>
                handleUpdate(selectedId, { texturePath: "/textures/fabric.png" })
              }
            >
              Fabric
            </button>
            <button
              onClick={() =>
                handleUpdate(selectedId, { texturePath: "/textures/metal.png" })
              }
            >
              Metal
            </button>
            <button
              onClick={() => handleUpdate(selectedId, { texturePath: null })}
            >
              None
            </button>
          </div>
          <div>
            <label>Scale: </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={selectedFurniture.scale[0]}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                handleUpdate(selectedId, { scale: [v, v, v] });
              }}
            />
          </div>
          <button onClick={() => onViewInAR(selectedFurniture.path)}>
            View in AR
          </button>
        </div>
      )}

            <div
             style={{
                width: "100%",
                height: "500px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
                <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                    <ambientLight intensity={0.6}/>
                    <directionalLight position={[5,10,5]} intensity={1}/>
                    <OrbitControls makeDefault/>

                    <mesh rotation={[-Math.PI / 2,0,0]}>
                        <planeGeometry args={[20,20]}/>
                        <meshStandardMaterial color={"#dddddd"}/>
                    </mesh>

                    {furnitures.map((f) => {
            const isSelected = f.id === selectedId;
            return (
              <group
                key={f.id}
                position={f.position}
                rotation={f.rotation}
                scale={f.scale}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(f.id);
                }}
              >
                <Model
                  path={f.path}
                  color={f.color}
                  texturePath={f.texturePath}
                  scaleX={1}
                  scaleY={1}
                  scaleZ={1}
                />

                {/* Outline / Selection Indicator */}
                {isSelected && (
                  <mesh>
                    <boxGeometry args={[1.2, 1.2, 1.2]} />
                    <meshBasicMaterial
                      color="yellow"
                      wireframe
                      transparent
                      opacity={0.3}
                    />
                  </mesh>
                )}

                {/* Transform Controls for selected furniture */}
                {isSelected && (
                  <TransformControls
                    ref={transformRef}
                    object={null}
                    mode="translate"
                    onObjectChange={() => {
                      const obj = transformRef.current.object;
                      if (obj) {
                        handleUpdate(f.id, {
                          position: [
                            obj.position.x,
                            obj.position.y,
                            obj.position.z,
                          ],
                        });
                      }
                    }}
                  >
                    <primitive object={new THREE.Object3D()} />
                  </TransformControls>
                )}
              </group>
            );
          })}
                </Canvas>
            </div>

            
        </>
    )
}

export default MultipleFurnitureCustomization;