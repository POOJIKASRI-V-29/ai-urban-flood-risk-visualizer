import { useState } from "react";
import { MapContainer, TileLayer, Circle } from "react-leaflet";

function App() {
  const [rainfall, setRainfall] = useState("");
  const [risk, setRisk] = useState("");

  const handlePredict = () => {
    if (rainfall > 250) {
      setRisk("High");
    } else if (rainfall > 150) {
      setRisk("Medium");
    } else {
      setRisk("Low");
    }
  };

  const getColor = () => {
    if (risk === "High") return "red";
    if (risk === "Medium") return "yellow";
    if (risk === "Low") return "green";
    return "blue";
  };

  return (
    <div>
      <h1>AI-Assisted Urban Flood Risk Visualizer</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Enter Rainfall (mm)"
          value={rainfall}
          onChange={(e) => setRainfall(e.target.value)}
        />

        <button 
          onClick={handlePredict}
          style={{ marginLeft: "10px" }}
        >
          Predict Risk
        </button>
      </div>

      {risk && <h2>{risk} Risk</h2>}

      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={10}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {risk && (
          <Circle
            center={[13.0827, 80.2707]}
            radius={5000}
            pathOptions={{ color: getColor() }}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default App;
