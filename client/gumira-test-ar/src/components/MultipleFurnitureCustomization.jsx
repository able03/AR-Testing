import {Canvas} from "@react-three/fiber";
import { OrbitControls, TransformControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useState, useRef, useEffect, useCallback } from "react";
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
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial
                color={color}
                map={texturePath ? texture : null}
            />
        </mesh>
    )
}

// Individual furniture component with ref tracking for proper TransformControls attachment
function FurnitureItem({ furniture, isSelected, onSelect, furnitureRefs, onUpdate, checkCollision }) {
    const groupRef = useRef();

    useEffect(() => {
        if (groupRef.current) {
            furnitureRefs.current[furniture.id] = groupRef.current;
        }
        return () => {
            delete furnitureRefs.current[furniture.id];
        };
    }, [furniture.id, furnitureRefs]);

    return (
        <group
            ref={groupRef}
            position={furniture.position}
            rotation={furniture.rotation}
            scale={furniture.scale}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(furniture.id);
            }}
        >
            <Model
                path={furniture.path}
                color={furniture.color}
                texturePath={furniture.texturePath}
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
}

function MultipleFurnitureCustomization({ furnitures, setFurnitures }){
    const [selectedId, setSelectedId] = useState(null);
    const transformRef = useRef();
    const furnitureRefs = useRef({});
    const [planeColor, setPlaneColor] = useState("#dddddd");
    const [planeTexture, setPlaneTexture] = useState(null);
    const [transformMode, setTransformMode] = useState("translate");
    const [collisionEnabled, setCollisionEnabled] = useState(true);
    const orbitControlsRef = useRef();

    // Model configurations with normalized scales
    const availableModels = [
        { name: "Wooden Cabinet", path: "/3d_wooden_cabinet.glb", defaultScale: 1.0 },
        { name: "Bunk Bed", path: "/bunk_bed.glb", defaultScale: 1.0 },
        { name: "Liquor Cabinet", path: "/liquor_cabinet.glb", defaultScale: 1.0 },
        { name: "Sofa", path: "/sofa.glb", defaultScale: 1.0 },
        { name: "Table Furniture", path: "/table_furniture.glb", defaultScale: 1.0 },
        { name: "Victorian Cabinet Double", path: "/victorian_cabinet_double.glb", defaultScale: 1.0 }
    ];

    // Check collision between furniture pieces
    const checkCollision = useCallback((furnitureId, newPosition) => {
        if (!collisionEnabled) return false;

        const currentFurniture = furnitures.find(f => f.id === furnitureId);
        if (!currentFurniture) return false;

        const currentBox = new THREE.Box3();
        const currentGroup = furnitureRefs.current[furnitureId];

        if (!currentGroup) return false;

        // Create a temporary position to check
        const tempPosition = new THREE.Vector3(...newPosition);
        const originalPosition = currentGroup.position.clone();
        currentGroup.position.copy(tempPosition);
        currentBox.setFromObject(currentGroup);
        currentGroup.position.copy(originalPosition);

        // Check against all other furniture
        for (const furniture of furnitures) {
            if (furniture.id === furnitureId) continue;

            const otherGroup = furnitureRefs.current[furniture.id];
            if (!otherGroup) continue;

            const otherBox = new THREE.Box3().setFromObject(otherGroup);
            if (currentBox.intersectsBox(otherBox)) {
                return true; // Collision detected
            }
        }

        return false;
    }, [furnitures, collisionEnabled]);

    const handleAddModel = (model) => {
        const id = Date.now();
        const scale = model.defaultScale || 1.0;

        // Find non-colliding position
        let position = [Math.random() * 4 - 2, 0, Math.random() * 4 - 2];
        let attempts = 0;

        setFurnitures((prev) => [
            ...prev,
            {
                id,
                path: model.path,
                position,
                rotation: [0, 0, 0],
                scale: [scale, scale, scale],
                color: "#cccccc",
                texturePath: "/textures/wood.jpg",
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

    const handleDelete = (id) => {
        setFurnitures((prev) => prev.filter((f) => f.id !== id));
        setSelectedId(null);
    };

    // Attach TransformControls to selected furniture
    useEffect(() => {
        if (transformRef.current && selectedId) {
            const targetGroup = furnitureRefs.current[selectedId];
            if (targetGroup) {
                transformRef.current.attach(targetGroup);
            }
        } else if (transformRef.current) {
            transformRef.current.detach();
        }
    }, [selectedId]);

    // Disable OrbitControls when using TransformControls
    useEffect(() => {
        const transformControls = transformRef.current;
        const orbitControls = orbitControlsRef.current;

        if (transformControls && orbitControls) {
            const onDragStart = () => {
                orbitControls.enabled = false;
            };
            const onDragEnd = () => {
                orbitControls.enabled = true;
            };

            transformControls.addEventListener('dragging-changed', (event) => {
                orbitControls.enabled = !event.value;
            });

            return () => {
                transformControls.removeEventListener('dragging-changed', onDragStart);
            };
        }
    }, []);


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

            {/* Collision Toggle */}
            <div style={{marginBottom: "10px"}}>
                <label>
                    <input
                        type="checkbox"
                        checked={collisionEnabled}
                        onChange={(e) => setCollisionEnabled(e.target.checked)}
                    />
                    Enable Collision Detection
                </label>
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
                    <div style={{marginBottom: "10px"}}>
                        <button
                            onClick={() => setTransformMode("translate")}
                            style={{background: transformMode === "translate" ? "#4CAF50" : "#ddd"}}
                        >
                            Move
                        </button>
                        <button
                            onClick={() => setTransformMode("rotate")}
                            style={{background: transformMode === "rotate" ? "#4CAF50" : "#ddd"}}
                        >
                            Rotate
                        </button>
                        <button
                            onClick={() => setTransformMode("scale")}
                            style={{background: transformMode === "scale" ? "#4CAF50" : "#ddd"}}
                        >
                            Scale
                        </button>
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
                        <span> {selectedFurniture.scale[0].toFixed(1)}</span>
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
                    <div style={{marginTop: "10px"}}>
                        <button onClick={() => handleDelete(selectedId)} style={{background: "#f44336", color: "white"}}>
                            Delete Furniture
                        </button>
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
                <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
                    <ambientLight intensity={0.6}/>
                    <directionalLight position={[5,10,5]} intensity={1} castShadow/>
                    <OrbitControls ref={orbitControlsRef} makeDefault/>

                    <GroundPlane color={planeColor} texturePath={planeTexture} />

                    {furnitures.map((f) => (
                        <FurnitureItem
                            key={f.id}
                            furniture={f}
                            isSelected={f.id === selectedId}
                            onSelect={handleSelect}
                            furnitureRefs={furnitureRefs}
                            onUpdate={handleUpdate}
                            checkCollision={checkCollision}
                        />
                    ))}

                    {/* Centralized TransformControls */}
                    {selectedFurniture && (
                        <TransformControls
                            ref={transformRef}
                            mode={transformMode}
                            size={0.75}
                            onObjectChange={() => {
                                const obj = transformRef.current?.object;
                                if (obj) {
                                    const newPosition = [obj.position.x, obj.position.y, obj.position.z];
                                    const newRotation = [obj.rotation.x, obj.rotation.y, obj.rotation.z];
                                    const newScale = [obj.scale.x, obj.scale.y, obj.scale.z];

                                    if (transformMode === 'translate') {
                                        // Check collision before updating
                                        if (!checkCollision(selectedFurniture.id, newPosition)) {
                                            handleUpdate(selectedFurniture.id, { position: newPosition });
                                        }
                                    } else if (transformMode === 'rotate') {
                                        handleUpdate(selectedFurniture.id, { rotation: newRotation });
                                    } else if (transformMode === 'scale') {
                                        handleUpdate(selectedFurniture.id, { scale: newScale });
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