import React from "react"
import ReactDOMClient from "react-dom/client"

import App from "./components/App"
import "./index.scss"

const container = document.getElementById('root')
const root = ReactDOMClient.createRoot(container)

root.render(<App />)
