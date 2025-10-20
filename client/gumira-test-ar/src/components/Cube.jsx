import { createRoot } from 'react-dom/client'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from "three";
import { useEffect } from 'react';

function Cube({color, height, width, depth, texture}){
    const map = useLoader(THREE.TextureLoader, texture);

    useEffect(() => {

        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(width, height)
        
    }, [map, width, height])

    return(
        <>
            <div className='canvas-container' height="500px">
                <Canvas>
                    <OrbitControls/>
                    <ambientLight intensity={0.6}/>
                    <directionalLight color="white" position={[1,1,1]}/>
                    <mesh>
                        <boxGeometry args={[width,height,depth]}/>
                        <meshStandardMaterial color={color} map={map}/>
                    </mesh>
                </Canvas>
            </div>
        </>
    )
}

createRoot(document.getElementById('root')).render(<Cube/>)
export default Cube;