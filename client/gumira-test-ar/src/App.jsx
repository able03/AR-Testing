import { useState } from 'react';
import './App.css'
import ARViewer from './components/ARViewer';
import MultipleFurnitureCustomization from './components/MultipleFurnitureCustomization'

function App() {
  const [furnitures, setFurnitures] = useState([]);
  const [arModelPath, setArModelPath] = useState(null);

  const handleViewInAR = (path) => {
    setArModelPath(path);
  };

  const handleCloseAR = () => {
    setArModelPath(null);
  };

  return (
    <>
      <h1>AR Furniture Customizer</h1>
      {arModelPath ? (
        <div>
          <button onClick={handleCloseAR}>Close AR</button>
          <ARViewer glbPath={arModelPath} />
        </div>
      ) : (
        <MultipleFurnitureCustomization
          furnitures={furnitures}
          setFurnitures={setFurnitures}
          onViewInAR={handleViewInAR}
        />
      )}
    </>
  )
}

export default App
