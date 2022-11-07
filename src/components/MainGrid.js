import React, { useEffect, useRef, useState } from "react"
import { spawnPiece } from "./assets"
import destroyLines from "./mouvements/destroyLines"
import moveX from "./mouvements/moveX"
import moveDown from "./mouvements/moveDown"
import rotate from "./mouvements/rotate"

const MainGrid = ({ container, db, blockSize, setBlockSize, setNextPiece, incrementScore, setLevel, level }) => {
  // num of milliseconds to fall 1 block
  const [dropSpeed, setDropSpeed] = useState(800)

  const [pieceBlocks, setPieceBlocks] = useState(null)
  const [gameActive, setGameActive] = useState(false)
  const [gridSpaces, setGridSpaces] = useState(null)
  const frame = 1000 / 60
  
  const mainGridRef = useRef()
  const pieceRef = useRef()


  // SET GRID SIZE AND EVENT LISTENER
  useEffect(() => {
    const setMainGridSpacesDimensions = () => {
      const mainGrid = mainGridRef.current
      const containerWidth = container.current.clientWidth
      const gridHeight = container.current.clientHeight
      mainGrid.style.width = containerWidth > 600 ? '600px' : containerWidth.toString() + 'px'
      
      let dimension = Math.floor(mainGrid.clientWidth / 120) * 10
      if (dimension * 22 <= gridHeight) {
        mainGrid.style.width = (dimension * 12).toString() + 'px'
        mainGrid.style.height = (dimension * 22).toString() + 'px'
      } else {
        dimension = Math.floor(mainGrid.clientHeight / 220) * 10
        mainGrid.style.width = (dimension * 12 + 2).toString() + 'px'
        mainGrid.style.height = (dimension * 22 + 2).toString() + 'px'
      }
      
      const mainGridSpaces = [].slice.call(mainGridRef.current.children).filter(space => space.classList.contains('grid-space'))
      mainGridSpaces.forEach(el => {
        el.style.width = dimension.toString() + 'px'
        el.style.height = dimension.toString() + 'px'
      })
    
      setBlockSize(dimension)
      setGridSpaces(mainGridSpaces)
      container.current.style.width = 'fit-content'
      container.current.style.height = 'fit-content'
    }
    
    setMainGridSpacesDimensions()
    window.addEventListener('resize', setMainGridSpacesDimensions)
    
    return () => {
      window.removeEventListener('resize', setMainGridSpacesDimensions)
    }
  }, [container, setBlockSize])
  

  useEffect(() => {
    if (!db || pieceBlocks) {
      return
    }

    // RENDER NEW PIECE
    const renderPiece = (piece) => {
      const blocks = piece.coordinates.map((coord, i) => {
        const coordX = coord.x * blockSize
        const coordY = coord.y * blockSize
        
        const style = {
          width: blockSize.toString() + 'px',
          height: blockSize.toString() + 'px',
          left: coordX.toString() + 'px',
          top: coordY.toString() + 'px',
          border: '2px solid rgb(240, 240, 240)'
        }
        return (
          <div className="block" key={i}>
            <div className={'front active-block piece ' + piece.color} style={style}></div>
            <div className={'back piece ' + piece.color} style={style}></div>
            <div className={'left piece ' + piece.color} style={style}></div>
            <div className={'right piece ' + piece.color} style={style}></div>
            <div className={'top piece ' + piece.color} style={style}></div>
            <div className={'bottom piece ' + piece.color} style={style}></div>
          </div>
        )
      })
      
      const coordX = piece.center.x * blockSize
      const coordY = piece.center.y * blockSize 
      const left = coordX.toString() + 'px'
      const top = coordY.toString() + 'px'
      

      pieceRef.current.style.top = top
      pieceRef.current.style.left = left
      pieceRef.current.style.transform = 'rotateZ(0deg) rotateX(-5deg) rotateY(-10deg)'
      db.coord = { x: coordX, y: coordY }
      db.initY = coordY
      setPieceBlocks(blocks)
    }

    if (!db.nextPiece) {
      db.nextPiece = spawnPiece()
    }

    let piece = spawnPiece()
    while (piece.name === db.nextPiece.name) {
      piece = spawnPiece()
    }

    db.piece = db.nextPiece
    db.nextPiece = piece
    setNextPiece(piece)
    renderPiece(db.piece)
  }, [db, pieceBlocks, blockSize, setNextPiece])
  
  useEffect(() => {
    
    if (!db || !gameActive) {
      return
    }

    // GAME SCORE AND LEVEL PARAMETERS
    const scoreChart = { 0: 0, 1: 40, 2: 100, 3: 300, 4: 1200 }
    const levelChart = {
      1: 43 * frame,
      2: 38 * frame,
      3: 33 * frame,
      4: 28 * frame,
      5: 25 * frame,
      6: 18 * frame,
      7: 13 * frame,
      8: 8 * frame,
      9: 6 * frame,
      10: 5 * frame,
      13: 4 * frame,
      16: 3 * frame,
      19: 2 * frame,
      29: 1 * frame
    }

    // CREATE EVENT LISTENER FOR CONTROLS
    const onKeyDown = (e) => {
      const movementKeys = ['ArrowLeft', 'ArrowRight', 'ArrowDown']
      const cmdKeys = [' ', 'p', 'm']
      if (
        (movementKeys.includes(e.key) || cmdKeys.includes(e.key)) &&
        !db.shortPush.includes(e.key) &&
        !db.longPush.includes(e.key) &&
        !db.buffer[e.key] &&
        !db.inputBlock[e.key]
      ) {
        db.shortPush = [...db.shortPush, e.key]

        if (movementKeys.includes(e.key)) {
          db.buffer[e.key] = setTimeout(() => {
            db.shortPush = db.shortPush.filter(key => key !== e.key)
            db.longPush = [...db.longPush, e.key]
          }, 6 * frame)
        }

        if (cmdKeys.includes(e.key)) {
          db.inputBlock[e.key] = true
          db.shortPush = [...db.shortPush, e.key]
        }
      }
    }
  
    const onKeyUp = (e) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', ' ', 'p', 'm']
      if (keys.includes(e.key)) {
        clearTimeout(db.buffer[e.key])
        delete db.buffer[e.key]
        db.inputBlock[e.key] = false
        db.shortPush = db.shortPush.filter(key => key !== e.key)
        db.longPush = db.longPush.filter(key => key !== e.key)
      }
    }
  
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    // RENDER PIECE EVERY FRAME
    const drawPiece = () => {
      pieceRef.current.style.left = db.coord.x.toString() + 'px'
      pieceRef.current.style.top = db.coord.y.toString() + 'px'
    }

    // CHECKS FOR MOVEMENT AND COLLISIONS
    const movingLeft = () => {
      return moveX(mainGridRef, pieceRef, -blockSize)
    }

    const movingRight = () => {
      return moveX(mainGridRef, pieceRef, blockSize)
    }

    const movingDown = (rate) => {
      return moveDown(mainGridRef, pieceRef, rate)
    }
    
    const rotation = () => {
      if (!rotate(mainGridRef, pieceRef)) {
        if (rotate(mainGridRef, pieceRef, -blockSize)) {
          db.coord.x -= blockSize
        } else if (rotate(mainGridRef, pieceRef, blockSize)) {
          db.coord.x += blockSize
        } else if (rotate(mainGridRef, pieceRef, -2 * blockSize)) {
          db.coord.x += -2 * blockSize
        } else if (rotate(mainGridRef, pieceRef, 2 * blockSize)) {
          db.coord.x += 2 * blockSize
        }
      }
    }

    const ghostPiece = () => {
      let offsetY = blockSize
      if (!movingDown(offsetY)) {
        db.redrawGhostPiece = false
        return
      }
      
      while (movingDown(offsetY + blockSize)) {
        offsetY += blockSize
      }

      const blockBounds = [].slice.call(pieceRef.current.children).filter(el => el.classList.contains('active-block')).map(block => block.getBoundingClientRect())
      const ghostBlockSpaces = blockBounds.map(bounds => {
        
        const blockBoundsX = []
        const blockBoundsY = []
        for (let i = bounds.left; i <= bounds.right; i++){
          blockBoundsX.push(i)
        }
    
        for (let i = bounds.top; i <= bounds.bottom; i++){
          blockBoundsY.push(i + offsetY)
        }

        const ghostBlock = gridSpaces.filter((space) => {
          space.classList.remove('ghost-piece')
          space.style.borderColor = 'rgb(240, 240, 240)'
          const spaceBounds = space.getBoundingClientRect()
          return (
            blockBoundsX.some(n => n > spaceBounds.left && n < spaceBounds.right) &&
            blockBoundsY.some(n => n > spaceBounds.top && n < spaceBounds.bottom)
          )
        }).pop()
        return ghostBlock
      })

      if (ghostBlockSpaces.some(space => !space)) {
        db.redrawGhostPiece = false
        return
      }

      ghostBlockSpaces.forEach(space => {
        space.classList.add('ghost-piece')
        space.style.borderColor = db.piece.color
      })
      
      db.redrawGhostPiece = false
    }

    // STOP PIECE FROM FALLING ON VERTICAL COLLISION
    const stopDroppingOnCollision = () => {
      [].slice.call(pieceRef.current.children).filter(el => el.classList.contains('active-piece')).forEach((block) => {
        const blockBounds = block.getBoundingClientRect()
        const blockBoundsX = []
        const blockBoundsY = []
        for (let i = blockBounds.left; i <= blockBounds.right; i++){
          blockBoundsX.push(i)
        }
    
        for (let i = blockBounds.top; i <= blockBounds.bottom; i++){
          blockBoundsY.push(i)
        }
        
        const takenSpace = [].slice.call(mainGridRef.current.children).filter((space) => {
          const spaceBounds = space.getBoundingClientRect()
          return (
            blockBoundsX.some(n => n > spaceBounds.left && n < spaceBounds.right) &&
            blockBoundsY.some(n => n > spaceBounds.top && n < spaceBounds.bottom) &&
            !space.classList.contains('active-block')
            )
          }).pop()
        
        takenSpace.classList.add('taken', db.piece.color)
      })
      
      clearInterval(refreshCycle)
      db.inputLock = true
      const numOfLines = destroyLines(mainGridRef)
      incrementScore(scoreChart[numOfLines])
      db.destroyedLines += numOfLines
      setLevel(Math.floor(db.destroyedLines / 10))
      if (levelChart[level]) {
        setDropSpeed(levelChart[level])
      }
      setPieceBlocks(null)
    }

    // BUFFER PERIOD TO MOVE A PIECE ONCE IT LANDED
    const beforeCollision = (rate) => {
      if (db.fallBufferTimeout) {
        return
      }

      db.fallBufferTimeout = setTimeout(() => {
        if (pieceBlocks && movingDown(rate)) {
          db.coord.y += rate
          drawPiece()
        } else {
          clearTimeout(db.fallBufferTimeout)
          stopDroppingOnCollision()
          delete db.fallBufferTimeout
        }
      }, 6 * frame)
    }
          
    // EXECUTE INPUTS FROM BUFFER EVERY FRAME WHEN NO COLLISION DETECTED
    const executeInputs = () => {
      if (db.inputLock) {
        return
      }

      const inputs = db.shortPush.concat(db.longPush)
      if (inputs.includes(' ')) {
        rotation()
        db.redrawGhostPiece = true
      }
      
      if (inputs.includes("ArrowLeft") && movingLeft()) {
        db.coord.x -= blockSize
        db.redrawGhostPiece = true
        drawPiece()
      } else if (inputs.includes("ArrowRight") && movingRight()) {
        db.coord.x += blockSize
        db.redrawGhostPiece = true
        drawPiece()
      }
      
      let rate
      if (inputs.includes('ArrowDown')) {
        rate = blockSize - ((db.coord.y + db.initY) % blockSize) 
      } else {
        rate = blockSize / (dropSpeed / frame)
      }
      if (movingDown(rate)) {
        db.coord.y += rate
        drawPiece()
      } else {
        beforeCollision(rate)
      }
      
      db.shortPush = []
    }

    const refreshCycle = setInterval(() => {
      if (pieceBlocks && db.piece) {
        drawPiece()
        if (db.redrawGhostPiece) {
          ghostPiece()
        }
        executeInputs()
      }
    }, frame)
    
    if (gameActive && pieceBlocks) {
      ghostPiece()
      setTimeout(() => {
        db.inputLock = false
      }, 30 * frame)
    }

    if (!movingDown(0)) {
      setGameActive(false)
    }
    
    return () => {
      clearInterval(refreshCycle)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [
    blockSize,
    dropSpeed,
    pieceBlocks,
    db,
    gameActive,
    gridSpaces,
    frame,
    incrementScore,
    level,
    setLevel
  ])


  const renderedGridSpaces = () => {
    const gridSpaces = []
    for (let y = 0; y < 22; y += 1) {
      for (let x = 0; x < 12; x += 1) {
        gridSpaces.push(<div id={`${x}, ${y}`} className="grid-space" key={`${x}, ${y}`}></div>)
      }
    }
  
    return gridSpaces
  }

  return (
    <div ref={mainGridRef} className="main-grid" onClick={() => setGameActive(true)}>
      {renderedGridSpaces()}
      <div ref={pieceRef} className='blocks'>
        {pieceBlocks}
      </div>
    </div>
  )
}

export default MainGrid