import React from "react"
import ReactDOMClient from "react-dom/client"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import reducer from "./reducer"

import App from "./components/App"
import "./index.scss"
import "./helpers"

const container = document.getElementById('root')
const root = ReactDOMClient.createRoot(container)
const store = configureStore({ reducer: reducer })

root.render(<Provider store={store}><App /></Provider>)

const query = {
    factor: "white",
    list: "orange",
    num: 3,
    fruit: "banada"
}
const url = query.toUrl("https://amazon.ca")
console.log(url);