import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainGrid from "./MainGrid"

const App = () => {
    return (
        <div className="container">
            <BrowserRouter>
                <Routes>
                    <Route path="/" exact element={<MainGrid />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App