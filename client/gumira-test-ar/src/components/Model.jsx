    import { useGLTF, useTexture } from "@react-three/drei";
    import { useEffect } from "react";
    import * as THREE from "three";

    function Model({path, texturePath, color = "#ffffff", scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1}){
        const { scene } = useGLTF(path);
        const texture = texturePath ? useTexture(texturePath) : null;

        // Update the model when there are changes
        useEffect(() => {
            scene.traverse((child) => {
            if(child.isMesh){
                child.material = new THREE.MeshStandardMaterial({
                    color,
                    map: texture,
                    roughness: 0.2,
                    metalness: 0.2
                });
            }
            }); 

        }, [color, scene, texture]); 

        // Return the model
        return <primitive object={scene} scale={[scaleX, scaleY, scaleZ]}/>            
    }

    export default Model;

