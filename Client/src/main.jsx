import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {SocketProvider} from './context/SocketProvider.jsx'
import Room from './components/Room.jsx'
createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
    <SocketProvider>
      <Routes>
      <Route path="/" element={<App/>}/>
      <Route path="/room/:roomId" element={<Room/>}/>
      </Routes>
      </SocketProvider>   
    </BrowserRouter>
  // </StrictMode>,
)
