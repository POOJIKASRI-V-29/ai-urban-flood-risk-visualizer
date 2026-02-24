import { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

function App() {
  const [rainfall, setRainfall] = useState(120);
  const [drainage, setDrainage] = useState(50);
  const [elevation, setElevation] = useState(50);
  const [risk, setRisk] = useState(null);
  const [level, setLevel] = useState("");

  const analyzeRisk = async () => {
  console.log("Button Clicked");  // ADD THIS

  try {
    const response = await axios.post("http://localhost:5000/api/analyze", {
      rainfall,
      drainage,
      elevation,
    });

    console.log(response.data); // ADD THIS

    setRisk(response.data.riskScore);
    setLevel(response.data.level);

  } catch (error) {
    console.error("Axios Error:", error);
  }
};


  const getColor = () => {
    if (level === "High") return "#dc3545";
    if (level === "Moderate") return "#ffc107";
    return "#28a745";
  };
const mumbaiData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Zone 1" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.85,19.05],[72.88,19.05],[72.88,19.08],[72.85,19.08],[72.85,19.05]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Zone 2" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.88,19.05],[72.91,19.05],[72.91,19.08],[72.88,19.08],[72.88,19.05]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Zone 3" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.85,19.08],[72.88,19.08],[72.88,19.11],[72.85,19.11],[72.85,19.08]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Zone 4" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.88,19.08],[72.91,19.08],[72.91,19.11],[72.88,19.11],[72.88,19.08]]]
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
        <div className="card">
          <h2>Input Data</h2>

          <label>Rainfall (mm)</label>
          <input
            type="range"
            min="0"
            max="300"
            value={rainfall}
            onChange={(e) => setRainfall(Number(e.target.value))}
          />
          <p>{rainfall} mm</p>

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

          <button className="analyze-btn" onClick={analyzeRisk}>
            ANALYZE RISK
          </button>
        </div>

        {/* MAP PANEL */}
        <div className="card" style={{ position: "relative" }}>
          <h2>Flood Risk Map - Mumbai</h2>

          <MapContainer
            center={[19.076, 72.8777]}
            zoom={11}
            style={{ height: "450px", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <GeoJSON
              data={mumbaiData}
              style={(feature) => {
  let zoneRisk = risk;

  if (feature.properties.name === "Zone 1") zoneRisk += 20;
  if (feature.properties.name === "Zone 2") zoneRisk -= 10;
  if (feature.properties.name === "Zone 3") zoneRisk += 40;
  if (feature.properties.name === "Zone 4") zoneRisk -= 20;

  let color = "#28a745";

  if (zoneRisk >= 180) color = "#dc3545";
  else if (zoneRisk >= 120) color = "#ffc107";

  return {
    fillColor: color,
    fillOpacity: 0.6,
    color: "#222",
    weight: 1
  };
}}
            />
          </MapContainer>

          {/* Legend */}
          <div className="legend">
            <div><span className="box red"></span> High Risk</div>
            <div><span className="box orange"></span> Moderate Risk</div>
            <div><span className="box green"></span> Low Risk</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="card">
          <h2>Risk Assessment</h2>

          {risk !== null ? (
            <>
              <div className="risk-circle">
                <div className="circle-inner">
                  <h3 style={{ color: getColor() }}>{level}</h3>
                  <p>{risk}</p>
                </div>
              </div>

              <p style={{ textAlign: "center" }}>
                Based on rainfall, drainage efficiency, and elevation factors.
              </p>
            </>
          ) : (
            <p>Click Analyze Risk to generate prediction.</p>
          )}
        </div>

      </div>

      {/* Recommended Actions */}
      <div className="actions">
        <div className="action-card">
          <h3>Emergency Alerts</h3>
          <p>Stay updated with official weather warnings.</p>
        </div>

        <div className="action-card">
          <h3>Safety Tips</h3>
          <p>Avoid flooded roads and low-lying areas.</p>
        </div>

        <div className="action-card">
          <h3>Infrastructure Check</h3>
          <p>Ensure drainage systems are functioning properly.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
