import { ARButton, XR, Interactive } from '@react-three/xr'
import { Canvas } from "@react-three/fiber";
import { OrbitControls, TransformControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useState, useRef, useEffect } from "react";
import Model from "./Model";


function ARFurniture({ furniture, onSelect, isSelected }) {
    const [model, setModel] = useState(null);

    return (
        <Interactive onSelect={() => onSelect(furniture.id)}>
            <group
                position={furniture.position}
                rotation={furniture.rotation}
                scale={furniture.scale}
            >
                <Model
                    path={furniture.path}
                    color={furniture.color}
                    texturePath={furniture.texturePath}
                    onModelLoad={setModel}
                />
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
        </Interactive>
    );
}

function ARViewer({ furnitures, setFurnitures, onCloseAR }) {
    const [selectedId, setSelectedId] = useState(null);
    const [transformMode, setTransformMode] = useState("translate");
    const transformRef = useRef();

    const handleUpdate = (id, updatedProps) => {
        setFurnitures((prev) =>
            prev.map((f) => (f.id === id ? { ...f, ...updatedProps } : f))
        );
    };

    const handleDelete = (id) => {
        setFurnitures((prev) => prev.filter((f) => f.id !== id));
        setSelectedId(null);
    };

    const selectedFurniture = furnitures.find((f) => f.id === selectedId);

    useEffect(() => {
        if (transformRef.current) {
            const controls = transformRef.current;
            if (selectedFurniture) {
                const sceneObject = controls.parent.getObjectByProperty('uuid', selectedFurniture.uuid);
                if (sceneObject) {
                    controls.attach(sceneObject);
                }
            } else {
                controls.detach();
            }
        }
    }, [selectedId, furnitures]);


    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <ARButton />
            <Canvas>
                <XR sessionInit={{ requiredFeatures: ["hit-test"] }}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 10, 5]} intensity={1} />

                    {furnitures.map((f) => (
                        <ARFurniture
                            key={f.id}
                            furniture={f}
                            onSelect={setSelectedId}
                            isSelected={f.id === selectedId}
                        />
                    ))}

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
                </XR>
            </Canvas>
            <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
                <button onClick={onCloseAR}>Close AR</button>
                {selectedFurniture && (
                    <div style={{ background: "white", padding: 10, marginTop: 10 }}>
                        <h3>Editing</h3>
                        <button onClick={() => setTransformMode("translate")}>Move</button>
                        <button onClick={() => setTransformMode("rotate")}>Rotate</button>
                        <button onClick={() => handleDelete(selectedId)}>Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ARViewer;