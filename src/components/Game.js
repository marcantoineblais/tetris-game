import React, { useState, useEffect, useRef } from "react"
import MainGrid from "./MainGrid"

const Game = () => {

  const [db, setDB] = useState(null)

  const containerRef = useRef()

  useEffect(() => {
    // CREATE LOCAL DB IN BROWSER
    const database = {}
    database.shortPush = []
    database.longPush = []
    database.inputBlock = {}
    database.buffer = {}
    database.score = 0
    database.destroyedLines = 0
    database.dropRate = 1
    setDB(database)
}, [])

  return (
    <div className="game">
      <div ref={containerRef} className="game-main-grid">
        <MainGrid container = {containerRef} db={db} />
      </div>
    </div>
  )
}

export default Game