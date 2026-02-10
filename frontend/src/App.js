import { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

function App() {
  const [city, setCity] = useState("Mumbai");
  const [rainfall, setRainfall] = useState(120);
  const [drainage, setDrainage] = useState(60);
  const [elevation, setElevation] = useState(40);

  const center = [19.076, 72.8777];

  const riskScore =
    rainfall * 0.5 +
    (100 - drainage) * 0.3 +
    (100 - elevation) * 0.2;

  let riskLevel = "Low";
  if (riskScore >= 180) riskLevel = "High";
  else if (riskScore >= 120) riskLevel = "Moderate";

  // ✅ HARDCODED GEOJSON (no import issues)
  const mumbaiData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Zone 1" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [72.85, 19.05],
              [72.92, 19.05],
              [72.92, 19.12],
              [72.85, 19.12],
              [72.85, 19.05]
            ]
          ]
        }
      }
    ]
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>URBAN FLOOD RISK VISUALIZER</h1>
        <p>AI-Assisted Flood Prediction System</p>
      </header>

      <div className="main-grid">

        {/* LEFT PANEL */}
        <div className="card input-panel">
          <h2>Input Data</h2>

          <label>Select City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option>Mumbai</option>
            <option>Chennai</option>
            <option>Bangalore</option>
          </select>

          <label>Rainfall (mm)</label>
          <input
            type="range"
            min="0"
            max="300"
            value={rainfall}
            onChange={(e) => setRainfall(Number(e.target.value))}
          />
          <span>{rainfall} mm</span>

          <label>Drainage Capacity</label>
          <input
            type="range"
            min="0"
            max="100"
            value={drainage}
            onChange={(e) => setDrainage(Number(e.target.value))}
          />

          <label>Elevation Factor</label>
          <input
            type="range"
            min="0"
            max="100"
            value={elevation}
            onChange={(e) => setElevation(Number(e.target.value))}
          />

          <button className="analyze-btn">ANALYZE RISK</button>
        </div>

        {/* MAP PANEL */}
        <div className="card map-panel">
          <h2>Flood Risk Map - {city}</h2>

          <MapContainer
            center={center}
            zoom={12}
            style={{ height: "450px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <GeoJSON
              data={mumbaiData}
              style={() => {
                let color = "green";
                if (riskLevel === "High") color = "red";
                else if (riskLevel === "Moderate") color = "orange";

                return {
                  fillColor: color,
                  color: "#333",
                  weight: 2,
                  fillOpacity: 0.6,
                };
              }}
            />
          </MapContainer>
        </div>

        {/* RIGHT PANEL */}
        <div className="card risk-panel">
          <h2>Risk Assessment</h2>
          <h3 className={riskLevel.toLowerCase()}>{riskLevel}</h3>
          <p>Risk Score: {riskScore.toFixed(2)}</p>
        </div>

      </div>
    </div>
  );
}

export default App;
