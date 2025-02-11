import { useState } from 'react'
import './App.css'
import 'bulma/css/bulma.min.css'
import Inicio from './components/inicio';

import cors from "cors";
const corsOrigin ={
    origin:'http://localhost:3000', //or whatever port your frontend is using
    credentials:true,            
    optionSuccessStatus:200
}
App.use(cors(corsOrigin));
function App() {
  
  return (
    <>
        <Inicio />
    </>
  )
}

export default App
