import React, { useEffect, useRef, useState } from "react"
import { spawnPiece } from "./assets"
import { wait } from "../helpers"
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
  
  const frame = 16.6
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
      db.coord = { x: coordX, y: coordY }
      db.initY = coordY
      setPieceBlocks(blocks)
    }

    let piece = spawnPiece()
    while (piece === db.piece) {
      piece = spawnPiece()
    }
    db.piece = piece
    renderPiece(piece)
  }, [db, pieceBlocks, blockSize])
  
  useEffect(() => {
    
    if (!db) {
      return
    }

    // CREATE EVENT LISTENER FOR CONTROLS
    const onKeyDown = (e) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', ' ', 'p', 'm']
      if (keys.includes(e.key) && !db.inputBuffer.includes(e.key)) {
        db.inputBuffer = [...db.inputBuffer, e.key]
      }
    }
  
    const onKeyUp = (e) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowDown']
      if (keys.includes(e.key)) {
        db.inputBuffer = db.inputBuffer.filter(key => key !== e.key)
      }
    }
  
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    // PIECE EVERY FRAME
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
    const movingDown = () => {
      return moveDown(mainGridRef, pieceRef)
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
      makePieceDrop(false)
      setPieceBlocks(null)
      const numOfLines = destroyLines(mainGridRef)
      db.destroyedLines = numOfLines
    }
      
      // MAKE PIECE FALL EVERY FRAME FOR 1 SPACE EVERY DROPSPEED TIME (MILLISECONDS)
      const makePieceDrop = (bool = true) => {
        const dropping = () => {
          if (pieceBlocks && movingDown()) {
            db.coord.y += db.dropRate
          } else {
            clearInterval(db.interval)
            stopDroppingOnCollision()
          }
        }
        const interval = dropSpeed / frame
          
        if (bool) {
          db.interval = setInterval(dropping, interval)
        } else {
          clearInterval(db.interval)
        }
      }

      // EXECUTE INPUTS FROM BUFFER EVERY FRAME WHEN NO COLLISION DETECTED
      const executeInputs = () => {

        if (db.inputBuffer.includes(' ')) {
          rotation()
          db.inputBuffer = db.inputBuffer.filter(key => key !== ' ')  
        }
        
        if (db.inputBuffer.includes("ArrowLeft") && movingLeft()) {
          db.coord.x -= blockSize
        } else if (db.inputBuffer.includes("ArrowRight") && movingRight()) {
          db.coord.x += blockSize
        }
        
        if (db.inputBuffer.includes('ArrowDown')) {
          makePieceDrop(false)
          if (movingDown()) {
            const rate = blockSize - ((db.coord.y + db.initY) % blockSize)
            console.log('position : ' + db.coord.y + '  rate : ' + rate);
            db.coord.y += rate
            makePieceDrop()
          } else {
            stopDroppingOnCollision()
          }
        }
      }
    

    const refreshCycle = setInterval(() => {
      if (pieceBlocks && db.piece) {
        drawPiece()
        executeInputs()
      }
    }, frame)
    

    if (gameActive) {
      makePieceDrop()
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
  }, [blockSize, dropSpeed, pieceBlocks, db, gameActive])


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