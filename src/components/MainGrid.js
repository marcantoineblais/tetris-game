import React, { useEffect, useRef, useState } from "react"
import { spawnPiece } from "./assets"
import destroyLines from "./mouvements/destroyLines"
import moveLeft from "./mouvements/moveLeft"
import moveRight from "./mouvements/moveRight"
import moveDown from "./mouvements/moveDown"
import rotate from "./mouvements/rotate"

const MainGrid = ({ container, db }) => {

  // width and height of a block
  const [blockSize, setBlockSize] = useState(null)
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
    }
    
    setMainGridSpacesDimensions()
    window.addEventListener('resize', setMainGridSpacesDimensions)
    
    return () => {
      window.removeEventListener('resize', setMainGridSpacesDimensions)
    }
  }, [container])
  

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
      
      pieceRef.current.style.top = top
      pieceRef.current.style.left = left
      pieceRef.current.style.transform = ''
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
    renderPiece(db.piece)
  }, [db, pieceBlocks, blockSize])
  
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
      return moveLeft(mainGridRef, pieceRef)
    }

    const movingRight = () => {
      return moveRight(mainGridRef, pieceRef)
    }

    const movingDown = (offset = 0) => {
      return moveDown(mainGridRef, pieceRef, offset)
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
      let offset = 0
      while (movingDown(offset + blockSize - (offset % blockSize))) {
        offset += blockSize - (offset % blockSize)
      }

      if (offset) {
        const blockBounds = [].slice.call(pieceRef.current.children).map(block => block.getBoundingClientRect())
        const ghostBlockSpaces = []
        blockBounds.forEach(bounds => {
          const ghostBlock = gridSpaces.filter((space) => {
            space.classList.remove('ghost-piece')
            space.style.borderColor = 'black'
            const spaceRect = space.getBoundingClientRect()
            return (
              spaceRect.left === bounds.left &&
              spaceRect.top <= bounds.bottom + offset &&
              spaceRect.bottom >= bounds.bottom + offset
            )
          }).pop()
          ghostBlockSpaces.push(ghostBlock)
        })
  
        ghostBlockSpaces.forEach(space => {
          space.classList.add('ghost-piece')
          space.style.borderColor = db.piece.color
        })
      }
      db.redrawGhostPiece = false
    }

    // STOP PIECE FROM FALLING ON VERTICAL COLLISION
    const stopDroppingOnCollision = () => {
      makePieceDrop(false)
      db.buffer.stopDropping = setTimeout(() => {
        if (!movingDown()) {
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
          makePieceDrop(false)
          setPieceBlocks(null)
        }
        clearTimeout(db.buffer.stopDropping)
        delete db.buffer.stopDropping
      }, 6 * frame) 
    }
      
    // MAKE PIECE FALL EVERY FRAME FOR 1 SPACE EVERY DROPSPEED TIME (MILLISECONDS)
    const makePieceDrop = (bool = true) => {
      const dropping = () => {
        if (pieceBlocks && movingDown()) {
          db.coord.y += blockSize / (dropSpeed / frame)
        } else {
          clearInterval(db.interval)
          stopDroppingOnCollision()
        }
      }
        
      if (bool) {
        db.interval = setInterval(dropping, frame)
      } else {
        clearInterval(db.interval)
      }
    }  
      
    // EXECUTE INPUTS FROM BUFFER EVERY FRAME WHEN NO COLLISION DETECTED
    const executeInputs = () => {
      if (db.inputLock) {
        return
      }

      [db.shortPush, db.longPush].forEach((inputs) => {
        if (inputs.includes(' ')) {
          rotation()
          db.redrawGhostPiece = true
          db.shortPush = db.shortPush.filter(key => key !== ' ')  
        }

        if (inputs.includes("ArrowLeft") && movingLeft()) {
          db.coord.x -= blockSize
          db.redrawGhostPiece = true
          db.shortPush = db.shortPush.filter(key => key !== 'ArrowLeft')
        } else if (inputs.includes("ArrowRight") && movingRight()) {
          db.coord.x += blockSize
          db.redrawGhostPiece = true
          db.shortPush = db.shortPush.filter(key => key !== 'ArrowRight')
        }
        
        if (inputs.includes('ArrowDown')) {
          makePieceDrop(false)
          const rate = blockSize - ((db.coord.y + db.initY) % blockSize)
          if (!db.buffer.stopDropping && movingDown()) {
            db.coord.y += rate
            makePieceDrop()
          } else {
            stopDroppingOnCollision()
          }
          db.shortPush = db.shortPush.filter(key => key !== 'ArrowDown')
        }
      })
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
        makePieceDrop()
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