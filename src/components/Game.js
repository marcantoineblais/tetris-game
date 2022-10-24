import React, { useRef } from "react"
import MainGrid from "./MainGrid"

const Game = () => {

  const containerRef = useRef()

  return (
    <div className="game">
      <div ref={containerRef} className="game-main-grid">
        <MainGrid container = {containerRef} />
      </div>
    </div>
  )
}

export default Game