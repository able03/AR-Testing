    import { useGLTF, useTexture } from "@react-three/drei";
    import { useEffect } from "react";
    import * as THREE from "three";

    function Model({path, texturePath, color = "#ffffff", scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1}){
        const { scene } = useGLTF(path);
        // Call useTexture unconditionally with a fallback to a transparent pixel to satisfy Rules of Hooks.
        const texture = useTexture(texturePath || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    
        // Update the model when there are changes
        useEffect(() => {
            scene.traverse((child) => {
            if(child.isMesh){
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
        return <primitive object={scene} scale={[scaleX, scaleY, scaleZ]}/>            
    }
    export default Model;

