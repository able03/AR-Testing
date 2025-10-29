    import { useGLTF, useTexture } from "@react-three/drei";
    import { useEffect, useState } from "react";
    import * as THREE from "three";

    function Model({path, texturePath, color = "#ffffff", scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1, onModelLoad}){
        const { scene } = useGLTF(path);
        // Call useTexture unconditionally with a fallback to a transparent pixel to satisfy Rules of Hooks.
        const texture = useTexture(texturePath || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        const [normalizedScale, setNormalizedScale] = useState([scaleX, scaleY, scaleZ]);

        // Normalize model size on first load
        useEffect(() => {
            if (scene) {
                const box = new THREE.Box3().setFromObject(scene);
                const size = box.getSize(new THREE.Vector3());
                const maxDimension = Math.max(size.x, size.y, size.z);

                // Normalize to approximately 1 unit, then apply user scale
                const normalizationFactor = 1 / maxDimension;
                setNormalizedScale([
                    normalizationFactor * scaleX,
                    normalizationFactor * scaleY,
                    normalizationFactor * scaleZ
                ]);

                // Callback to parent if needed
                if (onModelLoad) {
                    onModelLoad(scene);
                }
            }
        }, [scene, scaleX, scaleY, scaleZ, onModelLoad]);

        // Update the model when there are changes
        useEffect(() => {
            scene.traverse((child) => {
            if(child.isMesh){
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = new THREE.MeshStandardMaterial({
                    color,
                    // Conditionally apply the texture map only if a texturePath was provided.
                    map: texturePath ? texture : null,
                    roughness: 0.2,
                    metalness: 0.2
                });
            }
            });

        }, [color, scene, texture, texturePath]); // Added texturePath to the dependency array

        // Return the model
        return <primitive object={scene.clone()} scale={normalizedScale}/>
    }
    export default Model;

