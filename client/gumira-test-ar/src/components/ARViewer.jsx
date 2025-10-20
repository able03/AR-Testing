import "@google/model-viewer";

function ARViewer({ glbPath }) {
  if (!glbPath) return null;

  return (
    <model-viewer
      src={glbPath}
      alt="Customized Model"
      ar
      ar-modes="webxr scene-viewer quick-look"
      environment-image="neutral"
      shadow-intensity="1"
      camera-controls
      auto-rotate
      style={{ width: "100%", height: "500px", marginTop: "20px" }}
    ></model-viewer>
  );
}

export default ARViewer;
