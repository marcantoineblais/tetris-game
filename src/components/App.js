import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

const test = <p>Main Page</p>

const App = () => {
    return (
        <div className="container">
            <BrowserRouter>
                <Routes>
                    <Route path="/" exact element={test} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App