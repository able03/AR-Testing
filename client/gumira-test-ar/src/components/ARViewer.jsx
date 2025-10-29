import { ARButton, XR, Interactive, useXR } from '@react-three/xr'
import { Canvas } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import { useState, useRef, useEffect } from "react";
import Model from "./Model";

// AR Support Detection Component
function ARSupportDetector({ onSupportDetected }) {
    useEffect(() => {
        async function checkARSupport() {
            if ('xr' in navigator) {
                try {
                    const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
                    onSupportDetected(isSupported);
                } catch (error) {
                    console.error('Error checking AR support:', error);
                    onSupportDetected(false);
                }
            } else {
                onSupportDetected(false);
            }
        }
        checkARSupport();
    }, [onSupportDetected]);

    return null;
}


function ARFurniture({ furniture, onSelect, isSelected, furnitureRefs }) {
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
        <Interactive onSelect={() => onSelect(furniture.id)}>
            <group
                ref={groupRef}
                position={furniture.position}
                rotation={furniture.rotation}
                scale={furniture.scale}
            >
                <Model
                    path={furniture.path}
                    color={furniture.color}
                    texturePath={furniture.texturePath}
                    scaleX={1}
                    scaleY={1}
                    scaleZ={1}
                />
                {isSelected && (
                    <mesh>
                        <boxGeometry args={[1.5, 1.5, 1.5]} />
                        <meshBasicMaterial
                            color="cyan"
                            wireframe
                            transparent
                            opacity={0.5}
                        />
                    </mesh>
                )}
            </group>
        </Interactive>
    );
}

function ARViewer({ furnitures, setFurnitures, onCloseAR }) {
    const [selectedId, setSelectedId] = useState(null);
    const [transformMode, setTransformMode] = useState("translate");
    const [isARSupported, setIsARSupported] = useState(null);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showCustomizeMenu, setShowCustomizeMenu] = useState(false);
    const transformRef = useRef();
    const furnitureRefs = useRef({});

    const availableModels = [
        { name: "Wooden Cabinet", path: "/3d_wooden_cabinet.glb" },
        { name: "Bunk Bed", path: "/bunk_bed.glb" },
        { name: "Liquor Cabinet", path: "/liquor_cabinet.glb" },
        { name: "Sofa", path: "/sofa.glb" },
        { name: "Table Furniture", path: "/table_furniture.glb" },
        { name: "Victorian Cabinet", path: "/victorian_cabinet_double.glb" }
    ];

    const handleUpdate = (id, updatedProps) => {
        setFurnitures((prev) =>
            prev.map((f) => (f.id === id ? { ...f, ...updatedProps } : f))
        );
    };

    const handleDelete = (id) => {
        setFurnitures((prev) => prev.filter((f) => f.id !== id));
        setSelectedId(null);
    };

    const handleAddModel = (model) => {
        const id = Date.now();
        setFurnitures((prev) => [
            ...prev,
            {
                id,
                path: model.path,
                position: [0, 0, -2], // Place in front of camera
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                color: "#cccccc",
                texturePath: "/textures/wood.jpg",
            },
        ]);
        setShowAddMenu(false);
    };

    const selectedFurniture = furnitures.find((f) => f.id === selectedId);

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


    // Show AR not supported message
    if (isARSupported === false) {
        return (
            <div style={{ width: "100%", height: "100vh", padding: "20px" }}>
                <h2>AR Not Supported</h2>
                <p>Your device does not support WebXR AR. This feature requires:</p>
                <ul>
                    <li>Android device with ARCore support</li>
                    <li>iOS device (iOS 12+) with ARKit support</li>
                    <li>Chrome or Safari browser</li>
                </ul>
                <p>You can still use the 3D customization view to design your furniture layout.</p>
                <button onClick={onCloseAR} style={{ marginTop: "20px", padding: "10px 20px" }}>
                    Back to 3D Viewer
                </button>
            </div>
        );
    }

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <ARSupportDetector onSupportDetected={setIsARSupported} />

            {isARSupported !== null && (
                <>
                    <ARButton
                        sessionInit={{
                            requiredFeatures: ['hit-test', 'dom-overlay'],
                            domOverlay: { root: document.body }
                        }}
                    />
                    <Canvas>
                        <XR>
                            <ambientLight intensity={0.8} />
                            <directionalLight position={[5, 10, 5]} intensity={1.2} />

                            {furnitures.map((f) => (
                                <ARFurniture
                                    key={f.id}
                                    furniture={f}
                                    onSelect={setSelectedId}
                                    isSelected={f.id === selectedId}
                                    furnitureRefs={furnitureRefs}
                                />
                            ))}

                            {selectedFurniture && (
                                <TransformControls
                                    ref={transformRef}
                                    mode={transformMode}
                                    size={0.5}
                                    onObjectChange={() => {
                                        const obj = transformRef.current?.object;
                                        if (obj) {
                                            if (transformMode === 'translate') {
                                                handleUpdate(selectedFurniture.id, {
                                                    position: [obj.position.x, obj.position.y, obj.position.z],
                                                });
                                            } else if (transformMode === 'rotate') {
                                                handleUpdate(selectedFurniture.id, {
                                                    rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
                                                });
                                            } else if (transformMode === 'scale') {
                                                handleUpdate(selectedFurniture.id, {
                                                    scale: [obj.scale.x, obj.scale.y, obj.scale.z],
                                                });
                                            }
                                        }
                                    }}
                                />
                            )}
                        </XR>
                    </Canvas>

                    {/* UI Controls */}
                    <div style={{ position: "absolute", top: 10, left: 10, right: 10, zIndex: 1000 }}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button onClick={onCloseAR} style={{ padding: "10px 15px", background: "#f44336", color: "white", border: "none", borderRadius: "5px" }}>
                                Exit AR
                            </button>
                            <button onClick={() => setShowAddMenu(!showAddMenu)} style={{ padding: "10px 15px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px" }}>
                                {showAddMenu ? "Close Menu" : "Add Furniture"}
                            </button>
                            {selectedFurniture && (
                                <button onClick={() => setShowCustomizeMenu(!showCustomizeMenu)} style={{ padding: "10px 15px", background: "#2196F3", color: "white", border: "none", borderRadius: "5px" }}>
                                    Customize
                                </button>
                            )}
                        </div>

                        {/* Add Furniture Menu */}
                        {showAddMenu && (
                            <div style={{ background: "white", padding: "15px", marginTop: "10px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                                <h3 style={{ margin: "0 0 10px 0" }}>Add Furniture</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                    {availableModels.map((model) => (
                                        <button
                                            key={model.name}
                                            onClick={() => handleAddModel(model)}
                                            style={{ padding: "8px 12px", background: "#ddd", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                        >
                                            {model.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Customize Menu */}
                        {selectedFurniture && showCustomizeMenu && (
                            <div style={{ background: "white", padding: "15px", marginTop: "10px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)", maxWidth: "350px" }}>
                                <h3 style={{ margin: "0 0 10px 0" }}>Edit: {selectedFurniture.path.split("/").pop()}</h3>

                                <div style={{ marginBottom: "10px" }}>
                                    <label style={{ display: "block", marginBottom: "5px" }}>Transform Mode:</label>
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        <button
                                            onClick={() => setTransformMode("translate")}
                                            style={{
                                                padding: "8px 12px",
                                                background: transformMode === "translate" ? "#4CAF50" : "#ddd",
                                                color: transformMode === "translate" ? "white" : "black",
                                                border: "none",
                                                borderRadius: "4px"
                                            }}
                                        >
                                            Move
                                        </button>
                                        <button
                                            onClick={() => setTransformMode("rotate")}
                                            style={{
                                                padding: "8px 12px",
                                                background: transformMode === "rotate" ? "#4CAF50" : "#ddd",
                                                color: transformMode === "rotate" ? "white" : "black",
                                                border: "none",
                                                borderRadius: "4px"
                                            }}
                                        >
                                            Rotate
                                        </button>
                                        <button
                                            onClick={() => setTransformMode("scale")}
                                            style={{
                                                padding: "8px 12px",
                                                background: transformMode === "scale" ? "#4CAF50" : "#ddd",
                                                color: transformMode === "scale" ? "white" : "black",
                                                border: "none",
                                                borderRadius: "4px"
                                            }}
                                        >
                                            Scale
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: "10px" }}>
                                    <label style={{ display: "block", marginBottom: "5px" }}>Color:</label>
                                    <input
                                        type="color"
                                        value={selectedFurniture.color}
                                        onChange={(e) => handleUpdate(selectedId, { color: e.target.value })}
                                        style={{ width: "100%", height: "40px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "10px" }}>
                                    <label style={{ display: "block", marginBottom: "5px" }}>Texture:</label>
                                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                                        <button onClick={() => handleUpdate(selectedId, { texturePath: "/textures/wood.jpg" })} style={{ padding: "6px 10px", background: "#ddd", border: "none", borderRadius: "4px" }}>
                                            Wood
                                        </button>
                                        <button onClick={() => handleUpdate(selectedId, { texturePath: "/textures/fabric.png" })} style={{ padding: "6px 10px", background: "#ddd", border: "none", borderRadius: "4px" }}>
                                            Fabric
                                        </button>
                                        <button onClick={() => handleUpdate(selectedId, { texturePath: "/textures/metal.png" })} style={{ padding: "6px 10px", background: "#ddd", border: "none", borderRadius: "4px" }}>
                                            Metal
                                        </button>
                                        <button onClick={() => handleUpdate(selectedId, { texturePath: null })} style={{ padding: "6px 10px", background: "#ddd", border: "none", borderRadius: "4px" }}>
                                            None
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(selectedId)}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        background: "#f44336",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        marginTop: "10px"
                                    }}
                                >
                                    Delete Furniture
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Instruction Overlay */}
                    {furnitures.length === 0 && (
                        <div style={{
                            position: "absolute",
                            bottom: "20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "rgba(0,0,0,0.7)",
                            color: "white",
                            padding: "15px 25px",
                            borderRadius: "8px",
                            zIndex: 1000
                        }}>
                            Add furniture using the "Add Furniture" button above
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ARViewer;