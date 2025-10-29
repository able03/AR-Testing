import { useState } from 'react';
import './App.css'
import ARViewer from './components/ARViewer';
import MultipleFurnitureCustomization from './components/MultipleFurnitureCustomization'

function App() {
  const [furnitures, setFurnitures] = useState([]);
  const [arMode, setArMode] = useState(false);

  const handleViewInAR = () => {
    setArMode(true);
  };

  const handleCloseAR = () => {
    setArMode(false);
  };

  return (
    <>
      <h1>AR Furniture Customizer</h1>
      {arMode ? (
        <ARViewer
          furnitures={furnitures}
          setFurnitures={setFurnitures}
          onCloseAR={handleCloseAR}
        />
      ) : (
        <>
          <button onClick={handleViewInAR} style={{ marginBottom: "10px" }}>
            View All in AR
          </button>
          <MultipleFurnitureCustomization
            furnitures={furnitures}
            setFurnitures={setFurnitures}
          />
        </>
      )}
    </>
  )
}

export default App
