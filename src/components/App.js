import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

const test = (
    <div>
        <h1>App connected</h1>
        <p>Main Page</p>
    </div>
)

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