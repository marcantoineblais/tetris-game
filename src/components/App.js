import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Game from "./Game"

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" exact element={<Game />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App