import React, { useState, useEffect, useRef } from "react"
import MainGrid from "./MainGrid"
import NextPieceGrid from "./NextPieceGrid"
import Stats from "./Stats"

const Game = () => {

  const [db, setDB] = useState(null)
  const [blockSize, setBlockSize] = useState(null)
  const [nextPiece, setNextPiece] = useState(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(0)
  const containerRef = useRef()

  useEffect(() => {
    // CREATE LOCAL DB IN BROWSER
    const database = {}
    database.shortPush = []
    database.longPush = []
    database.inputBlock = {}
    database.buffer = {}
    database.destroyedLines = 0
    database.dropRate = 1
    setDB(database)
}, [])

  const incrementScore = (points) => {
    setScore(score + points)
  }

  return (
    <div className="game">
      <div className="game-stats">
        <Stats
          score={score}
          level={level}
        />
      </div>
      <div className="grid">
        <div ref={containerRef} className="game-main-grid">
          <MainGrid
            container={containerRef}
            db={db}
            blockSize={blockSize}
            setBlockSize={setBlockSize}
            setNextPiece={setNextPiece}
            incrementScore={incrementScore}
            level = {level}
            setLevel={setLevel}
          />
        </div>
        <div className="game-next-grid">
          <NextPieceGrid
            piece={nextPiece}
            blockSize={blockSize}
          />
        </div>
      </div>
    </div>
  )
}

export default Game