import Cube from "./Cube";
import { useState } from "react";
import ModelViewer from "./ModelViewer";

function Customization(){
    const [color, setColor] = useState("pink");
    const [height, setHeight] = useState(2);
    const [width, setWidth] = useState(2);
    const [depth, setDepth] = useState(2);
    const [texture, setTexture] = useState("/aba.webp");
    const [modelTexture, setModelTexture] = useState("/textures/wood.jpg");
    const [model, setModel] = useState("/sofa.glb");

    return(
        <>
            <Cube color={color} height={height} width={width} depth={depth} texture={texture}/>

            <ModelViewer
                color={color}
                width={width}
                height={height}
                depth={depth}
                texturePath={modelTexture}
                modelPath={model}
            />


            {/* Colors */}
            <div>
                <div>Colors</div>
                <button className="btn" onClick={() => setColor("red")}>Red</button>
                <button className="btn" onClick={() => setColor("blue")}>Blue</button>
                <button className="btn" onClick={() => setColor("pink")}>Pink</button>
                <button className="btn" onClick={() => setColor("white")}>White</button>
            </div>

            {/* Textures */}
            <div>
                <div>Textures</div>
                <button className="btn" onClick={() => setTexture("/aba.webp")}>Wood</button>
                <button className="btn" onClick={() => setTexture("/cotton.webp")}>Flowers</button>
                <button className="btn" onClick={() => setTexture("/cotton 2.webp")}>Group</button>
            </div>

            {/* Dimensions */}
            <label htmlFor="width">Width</label>
            <input id="width" type="range" min="1" max="3" step="0.1" onChange={(e) => setWidth(parseFloat(e.target.value))}/>
            <label htmlFor="height">Height</label>
            <input id="height" type="range" min="1" max="3" step="0.1" onChange={(e) => setHeight(parseFloat(e.target.value))}/>
            <label htmlFor="depth">Depth</label>
            <input id="depth" type="range" min="1" max="3" step="0.1" onChange={(e) => setDepth(parseFloat(e.target.value))}/>

            {/* Model Textures */}
            <div>
                <div>Model Textures</div>
                <button className="btn" onClick={() => setModelTexture("/textures/fabric.png")}>Fabric</button>
                <button className="btn" onClick={() => setModelTexture("/textures/metal.png")}>Metal</button>
                <button className="btn" onClick={() => setModelTexture("/textures/wood.jpg")}>Wood</button>
                {/* <button className="btn" onClick={() => setModelTexture("")}>None</button> */}
            </div>

            {/* Models */}
            <div>
                <div>Models</div>
                <button className="btn" onClick={() => setModel("/table_furniture.glb")}>Table Furniture</button>
                <button className="btn" onClick={() => setModel("/bunk_bed.glb")}>Bunk Bed</button>
                <button className="btn" onClick={() => setModel("/sofa.glb")}>L-Shape Sofa</button>
                <button className="btn" onClick={() => setModel("/3d_wooden_cabinet.glb")}>3D Wooden Cabinet</button>
                <button className="btn" onClick={() => setModel("/liquor_cabinet.glb")}>Liquor Cabinet</button>
                <button className="btn" onClick={() => setModel("/victorian_cabinet_double.glb")}>Victorian Cabinet Double</button>
            </div>
        </>
    )
}

export default Customization;