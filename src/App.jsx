import { useState } from 'react'
import './App.css'
import 'bulma/css/bulma.min.css'
import { Inicio } from './components/inicio';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <Inicio name="trini" />
    </>
  )
}

export default App
