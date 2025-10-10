import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"

// Disable Mapbox telemetry globally before any map initialization
if (window.mapboxgl) {
  window.mapboxgl.setTelemetryEnabled(false);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
