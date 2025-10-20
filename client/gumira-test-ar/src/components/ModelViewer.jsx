import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei' 
import Model from './Model';

function ModelViewer({color, width, height, depth, texturePath, modelPath}){
    return(
        <>
            <div className='canvas-container' height="700px">
                <Canvas camera={{position: [2,2,3], fov: 50}}>
                    <OrbitControls/>
                    <ambientLight intensity={0.6}/>
                    <directionalLight color="white" position={[1,1,1]}/>
                    <Model 
                        path={modelPath}
                        color={color}
                        scaleX={width}
                        scaleY={height}
                        scaleZ={depth}
                        texturePath={texturePath}
                    />
                </Canvas>
            </div>
        </>
    )
}

export default ModelViewer;