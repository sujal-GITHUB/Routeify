import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import { socketContext } from './context/socketContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <socketContext.Provider value={{}}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </socketContext.Provider>
  </StrictMode>,
)
