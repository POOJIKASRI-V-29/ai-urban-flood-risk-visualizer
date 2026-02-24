import { useEffect, useRef } from "react";

// Real flood-prone coordinates for each city's zones
const CITY_ZONES = {
  Mumbai: {
    center: [19.076, 72.8777],
    zoom: 12,
    zones: [
      {
        name: "Kurla", risk: "high", intensity: 0.95,
        polygon: [[19.065,72.878],[19.075,72.895],[19.060,72.900],[19.048,72.890],[19.055,72.875]],
      },
      {
        name: "Dharavi", risk: "high", intensity: 0.90,
        polygon: [[19.038,72.848],[19.048,72.862],[19.035,72.868],[19.025,72.858],[19.030,72.845]],
      },
      {
        name: "Andheri East", risk: "high", intensity: 0.85,
        polygon: [[19.110,72.868],[19.125,72.882],[19.115,72.895],[19.100,72.885],[19.105,72.868]],
      },
      {
        name: "Sion", risk: "high", intensity: 0.88,
        polygon: [[19.038,72.860],[19.048,72.872],[19.040,72.880],[19.030,72.870],[19.032,72.858]],
      },
      {
        name: "Bandra East", risk: "moderate", intensity: 0.60,
        polygon: [[19.052,72.855],[19.062,72.868],[19.055,72.878],[19.045,72.868],[19.048,72.852]],
      },
      {
        name: "Dadar", risk: "moderate", intensity: 0.55,
        polygon: [[19.018,72.842],[19.028,72.855],[19.020,72.862],[19.010,72.852],[19.012,72.840]],
      },
      {
        name: "Malad", risk: "low", intensity: 0.25,
        polygon: [[19.185,72.840],[19.198,72.855],[19.190,72.865],[19.178,72.855],[19.180,72.838]],
      },
      {
        name: "Borivali", risk: "low", intensity: 0.20,
        polygon: [[19.228,72.855],[19.240,72.868],[19.232,72.878],[19.220,72.868],[19.222,72.852]],
      },
      {
        name: "Colaba", risk: "low", intensity: 0.22,
        polygon: [[18.905,72.812],[18.915,72.825],[18.908,72.832],[18.898,72.822],[18.900,72.810]],
      },
    ],
  },
  Delhi: {
    center: [28.6139, 77.2090],
    zoom: 11,
    zones: [
      {
        name: "Yamuna Bank", risk: "high", intensity: 0.92,
        polygon: [[28.618,77.282],[28.635,77.298],[28.625,77.310],[28.610,77.300],[28.612,77.280]],
      },
      {
        name: "Shahdara", risk: "high", intensity: 0.88,
        polygon: [[28.668,77.288],[28.682,77.302],[28.672,77.315],[28.658,77.305],[28.660,77.285]],
      },
      {
        name: "Lajpat Nagar", risk: "moderate", intensity: 0.58,
        polygon: [[28.565,77.238],[28.578,77.252],[28.568,77.262],[28.555,77.252],[28.558,77.235]],
      },
      {
        name: "Dwarka", risk: "low", intensity: 0.22,
        polygon: [[28.582,77.042],[28.595,77.058],[28.585,77.068],[28.572,77.058],[28.575,77.040]],
      },
      {
        name: "Rohini", risk: "low", intensity: 0.28,
        polygon: [[28.742,77.108],[28.755,77.122],[28.745,77.132],[28.732,77.122],[28.735,77.105]],
      },
    ],
  },
  Chennai: {
    center: [13.0827, 80.2707],
    zoom: 12,
    zones: [
      {
        name: "Adyar", risk: "high", intensity: 0.93,
        polygon: [[13.001,80.252],[13.015,80.268],[13.005,80.278],[12.992,80.268],[12.995,80.250]],
      },
      {
        name: "Velachery", risk: "high", intensity: 0.88,
        polygon: [[12.978,80.218],[12.992,80.232],[12.982,80.242],[12.968,80.232],[12.972,80.215]],
      },
      {
        name: "T.Nagar", risk: "moderate", intensity: 0.55,
        polygon: [[13.038,80.228],[13.050,80.242],[13.040,80.252],[13.028,80.242],[13.032,80.225]],
      },
      {
        name: "Porur", risk: "low", intensity: 0.25,
        polygon: [[13.032,80.158],[13.045,80.172],[13.035,80.182],[13.022,80.172],[13.025,80.155]],
      },
      {
        name: "Tambaram", risk: "moderate", intensity: 0.52,
        polygon: [[12.922,80.118],[12.935,80.132],[12.925,80.142],[12.912,80.132],[12.915,80.115]],
      },
    ],
  },
};

const RISK_STYLES = {
  high:     { color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.45, weight: 2, opacity: 0.9 },
  moderate: { color: "#f97316", fillColor: "#f97316", fillOpacity: 0.40, weight: 2, opacity: 0.9 },
  low:      { color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.35, weight: 2, opacity: 0.9 },
};

export default function FloodMap({ city, onZoneClick }) {
  const mapRef     = useRef(null);
  const instanceRef = useRef(null);
  const layersRef  = useRef([]);

  useEffect(() => {
    // Dynamically load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Dynamically load Leaflet JS then initialize map
    const initMap = () => {
      const L = window.L;
      if (!L || !mapRef.current) return;

      // Destroy previous instance
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }

      const data = CITY_ZONES[city];

      const map = L.map(mapRef.current, {
        center: data.center,
        zoom: data.zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      instanceRef.current = map;

      // OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Clear old layers
      layersRef.current = [];

      // Draw flood zone polygons
      data.zones.forEach((zone) => {
        const style = RISK_STYLES[zone.risk];

        const polygon = L.polygon(zone.polygon, {
          ...style,
          className: "flood-zone-polygon",
        }).addTo(map);

        // Tooltip on hover
        polygon.bindTooltip(
          `<div style="font-family:sans-serif;font-size:12px;font-weight:600;">
            <span style="color:${style.color}">●</span> ${zone.name}<br/>
            <span style="color:#64748b;font-weight:400;">Risk: ${zone.risk.toUpperCase()}</span>
          </div>`,
          { sticky: true, opacity: 0.95 }
        );

        // Hover effects
        polygon.on("mouseover", function () {
          this.setStyle({ fillOpacity: Math.min(style.fillOpacity + 0.2, 0.75), weight: 3 });
        });
        polygon.on("mouseout", function () {
          this.setStyle(style);
        });
        polygon.on("click", function () {
          if (onZoneClick) onZoneClick(zone);
        });

        layersRef.current.push(polygon);
      });
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src  = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [city]);

  return (
    <div style={{ position: "relative", width: "100%", height: 320, borderRadius: 12, overflow: "hidden" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* Legend overlay */}
      <div style={{
        position: "absolute", bottom: 16, right: 16, zIndex: 999,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(6px)",
        borderRadius: 10, padding: "10px 14px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        fontSize: 12, fontFamily: "sans-serif",
      }}>
        {[["#ef4444","High Risk"],["#f97316","Moderate Risk"],["#22c55e","Low Risk"]].map(([c,l]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:8, marginBottom: l==="Low Risk"?0:5 }}>
            <div style={{ width:14, height:14, borderRadius:3, background:c, opacity:0.85 }} />
            <span style={{ color:"#1e293b", fontWeight:500 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}