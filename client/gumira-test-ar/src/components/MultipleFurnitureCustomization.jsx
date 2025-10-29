import {Canvas} from "@react-three/fiber";
import { OrbitControls, TransformControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useState, useRef, useEffect } from "react";
import  Model  from "./Model";

// New component for the ground plane to handle its own texture loading
function GroundPlane({ color, texturePath }) {
    // Unconditional hook call for texture loading
    const texture = useTexture(texturePath || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');

    useEffect(() => {
        if (texturePath) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(10, 10); // Tile the texture
            texture.needsUpdate = true;
        }
    }, [texture, texturePath]);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial
                color={color}
                map={texturePath ? texture : null}
            />
        </mesh>
    )
}


function MultipleFurnitureCustomization({ furnitures, setFurnitures }){
    const [selectedId, setSelectedId] = useState(null);
    const transformRef = useRef();
    const [planeColor, setPlaneColor] = useState("#dddddd");
    const [planeTexture, setPlaneTexture] = useState(null);
    const [transformMode, setTransformMode] = useState("translate"); // New state for transform mode

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
                position: [Math.random() * 4 - 2, 0, Math.random() * 4 - 2],
                rotation: [0, 0, 0], // Initial rotation
                scale: [1, 1, 1],
                color: "#cccccc", // Default color
                texturePath: "/textures/wood.jpg", // Default texture
            },
        ]);
    };

    const handleSelect = (id) => setSelectedId(id);
    const selectedFurniture = furnitures.find((f) => f.id === selectedId);

    const handleUpdate = (id, updatedProps) => {
        setFurnitures((prev) =>
            prev.map((f) => (f.id === id ? { ...f, ...updatedProps } : f))
        );
    };

    // Attach and detach TransformControls
    useEffect(() => {
        if (transformRef.current) {
            const controls = transformRef.current;
            const selectedObject = furnitures.find(f => f.id === selectedId);
            if (selectedObject) {
                const sceneObject = controls.parent.getObjectByProperty('uuid', selectedObject.uuid);
                if (sceneObject) {
                    controls.attach(sceneObject);
                }
            }

            return () => {
                controls.detach();
            };
        }
    }, [selectedId, furnitures]);


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
                    {/* Transform Mode Toggle */}
                    <div>
                        <button onClick={() => setTransformMode("translate")}>Move</button>
                        <button onClick={() => setTransformMode("rotate")}>Rotate</button>
                    </div>
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
                    {/* Rotation Sliders */}
                    <div>
                        <label>Rotate X: </label>
                        <input type="range" min="-3.14" max="3.14" step="0.01" value={selectedFurniture.rotation[0]} onChange={(e) => handleUpdate(selectedId, { rotation: [parseFloat(e.target.value), selectedFurniture.rotation[1], selectedFurniture.rotation[2]] })} />
                    </div>
                    <div>
                        <label>Rotate Y: </label>
                        <input type="range" min="-3.14" max="3.14" step="0.01" value={selectedFurniture.rotation[1]} onChange={(e) => handleUpdate(selectedId, { rotation: [selectedFurniture.rotation[0], parseFloat(e.target.value), selectedFurniture.rotation[2]] })} />
                    </div>
                    <div>
                        <label>Rotate Z: </label>
                        <input type="range" min="-3.14" max="3.14" step="0.01" value={selectedFurniture.rotation[2]} onChange={(e) => handleUpdate(selectedId, { rotation: [selectedFurniture.rotation[0], selectedFurniture.rotation[1], parseFloat(e.target.value)] })} />
                    </div>
                    </div>
            )}

            {/* Plane Customization Panel */}
            <div style={{ padding: "10px", border: "1px solid #aaa", marginBottom: "10px", background: "#f8f8f8", borderRadius: "8px" }}>
                <h3>Plane Customization</h3>
                <div>
                    <label>Color: </label>
                    <input type="color" value={planeColor} onChange={(e) => setPlaneColor(e.target.value)} />
                </div>
                <div>
                    <label>Texture: </label>
                    <button onClick={() => setPlaneTexture("/textures/wood.jpg")}>Wood</button>
                    <button onClick={() => setPlaneTexture("/textures/fabric.png")}>Fabric</button>
                    <button onClick={() => setPlaneTexture("/textures/metal.png")}>Metal</button>
                    <button onClick={() => setPlaneTexture(null)}>None</button>
                </div>
            </div>


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

                    <GroundPlane color={planeColor} texturePath={planeTexture} />

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
                        </group>
                        );
          })}
          {/* Centralized TransformControls */}
          {selectedFurniture && (
              <TransformControls
                  ref={transformRef}
                  mode={transformMode}
                  onObjectChange={() => {
                      const obj = transformRef.current.object;
                      if (obj) {
                          if (transformMode === 'translate') {
                              handleUpdate(selectedFurniture.id, {
                                  position: [obj.position.x, obj.position.y, obj.position.z],
                              });
                          } else if (transformMode === 'rotate') {
                              handleUpdate(selectedFurniture.id, {
                                  rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
                              });
                          }
                      }
                  }}
              />
          )}
                </Canvas>
            </div>

            
        </>
    )
}

export default MultipleFurnitureCustomization;