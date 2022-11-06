import React, { useEffect, useRef, useState } from "react"
import { spawnPiece } from "./assets"
import destroyLines from "./mouvements/destroyLines"
import moveX from "./mouvements/moveX"
import moveDown from "./mouvements/moveDown"
import rotate from "./mouvements/rotate"

const MainGrid = ({ container, db, blockSize, setBlockSize, setNextPiece, setScore, setLevel }) => {
  // num of milliseconds to fall 1 block
  const [dropSpeed, setDropSpeed] = useState(750)

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
        mainGrid.style.width = (dimension * 12).toString() + 'px'
        mainGrid.style.height = (dimension * 22).toString() + 'px'
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
      const blocks = []
      piece.coordinates.forEach((coord, i) => {
        const coordX = coord.x * blockSize
        const coordY = coord.y * blockSize
        
        const style = {
          width: blockSize.toString() + 'px',
          height: blockSize.toString() + 'px',
          left: coordX.toString() + 'px',
          top: coordY.toString() + 'px'
        }
        blocks.push(<div className={'active-block ' + piece.color} style={style} key={i}></div>)
      })
      
      const coordX = piece.center.x * blockSize
      const coordY = piece.center.y * blockSize
      const left = coordX.toString() + 'px'
      const top = coordY.toString() + 'px'
      const shadow = `${blockSize}px ${blockSize / 5}px ${db.piece.color}` 
      

      pieceRef.current.style.top = top
      pieceRef.current.style.left = left
      pieceRef.current.style.transform = ''
      pieceRef.current.style.boxShadow = shadow
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
      if (!movingDown()) {
        db.redrawGhostPiece = false
        return
      }
      
      let offsetY = blockSize - (db.coord.y + db.initY) % (blockSize / 2)
      while (movingDown(offsetY)) {
        offsetY += blockSize / 2
      }

      const blockBounds = [].slice.call(pieceRef.current.children).map(block => block.getBoundingClientRect())
      const ghostBlockSpaces = blockBounds.map(bounds => {
        const boundsX = (bounds.left + bounds.right) / 2
        const boundsY = ((bounds.top + bounds.bottom) / 2) + offsetY
        const ghostBlock = gridSpaces.filter((space) => {
          space.classList.remove('ghost-piece')
          space.style.borderColor = 'rgb(240, 240, 240)'
          const spaceRect = space.getBoundingClientRect()
          return (
            spaceRect.left < boundsX && spaceRect.right > boundsX &&
            spaceRect.top < boundsY && spaceRect.bottom > boundsY &&
            !space.classList.contains('active-block')
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
      [].slice.call(pieceRef.current.children).forEach((block) => {
        const blockBounds = block.getBoundingClientRect()
        const blockBoundsX = (blockBounds.right + blockBounds.left) / 2
        const blockBoundsY = (blockBounds.bottom + blockBounds.top) / 2
        
        const takenSpace = [].slice.call(mainGridRef.current.children).filter((space) => {
          const spaceRect = space.getBoundingClientRect()
          return (
            spaceRect.left < blockBoundsX && spaceRect.right > blockBoundsX &&
            spaceRect.top < blockBoundsY && spaceRect.bottom > blockBoundsY &&
            !space.classList.contains('active-block')
            )
          }).pop()
        
        takenSpace.classList.add('taken', db.piece.color)
      })
      
      clearInterval(refreshCycle)
      db.inputLock = true
      const numOfLines = destroyLines(mainGridRef)
      db.destroyedLines = numOfLines
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

    if (!movingDown()) {
      setGameActive(false)
    }
    
    return () => {
      clearInterval(refreshCycle)
      clearInterval(db.interval)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [blockSize, dropSpeed, pieceBlocks, db, gameActive, gridSpaces, frame])


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
      <div ref={pieceRef} style={{ position: 'absolute'}}>
        {pieceBlocks}
      </div>
    </div>
  )
}

export default MainGrid