import React from "react"
import ReactDOMClient from "react-dom/client"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import reducer from "./reducer"
import { BrowserRouter, Route } from "react-router-dom"

import App from "./components/App"

const container = document.getElementById('root')
const root = ReactDOMClient.createRoot(container)
const store = configureStore({ reducer: reducer })

root.render(<Provider store={store}><App /></Provider>)