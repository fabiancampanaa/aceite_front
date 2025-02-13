import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import App from './App.jsx'
import Dashboard from './components/dashboard.jsx'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        <Route path="/" element={ <App />} />
        <Route path="/dashboard" element={<Dashboard/>} />
      </Routes>
    
    </StrictMode>
  </BrowserRouter>

)
