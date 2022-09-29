import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

const test = <h1>Main Page</h1>

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