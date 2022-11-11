import React, { useEffect, useRef, useState } from "react"
import { spawnPiece } from "./assets"
import moveX from "./mouvements/moveX"
import moveDown from "./mouvements/moveDown"
import rotate from "./mouvements/rotate"

const MainGrid = ({ container, db, blockSize, setBlockSize, setNextPiece, incrementScore, setLevel, level }) => {
  // num of milliseconds to fall 1 block
  const [dropSpeed, setDropSpeed] = useState(800)
  const [pieceBlocks, setPieceBlocks] = useState(null)
  const [gameActive, setGameActive] = useState(false)
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
      mainGridSpaces.forEach(block => {
        block.style.width = dimension.toString() + 'px'
        block.style.height = dimension.toString() + 'px';
      })
    
      setBlockSize(dimension)
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
        
        const blockStyle = {
          width: blockSize.toString() + 'px',
          height: blockSize.toString() + 'px',
          left: coordX.toString() + 'px',
          top: coordY.toString() + 'px',
          borderColor: 'rgba(0, 0, 0, 0.1)'
        }

        return (
          <div className={"block piece " + piece.color} style={blockStyle} key={i}>
            <div className='front face'></div> 
            <div className='back face'></div>
            <div className='left face'></div>
            <div className='right face'></div>
            <div className='top face'></div>
            <div className='bottom face'></div>
          </div>
        )
      })
      
      const coordX = piece.center.x * blockSize
      const coordY = piece.center.y * blockSize 
      const left = coordX.toString() + 'px'
      const top = coordY.toString() + 'px'
      

      pieceRef.current.style.top = top
      pieceRef.current.style.left = left
      pieceRef.current.style.transform = 'rotateZ(0deg)'
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
          }, 4 * frame)
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
    const mainGridBounds = mainGridRef.current.getBoundingClientRect()
    const mainGridSpaces = mainGridRef.current.children
    const movingLeft = () => {
      return moveX(mainGridBounds, mainGridSpaces, pieceRef, db.takenSpaces, -blockSize)
    }

    const movingRight = () => {
      return moveX(mainGridBounds, mainGridSpaces, pieceRef, db.takenSpaces, blockSize)
    }

    const movingDown = (rate, offsetX = 0) => {
      return moveDown(mainGridBounds, mainGridSpaces, pieceRef, db.takenSpaces, rate, offsetX)
    }
    
    const rotation = () => {
      if (!rotate(mainGridBounds, mainGridSpaces, pieceRef, db.takenSpaces, db.piece.maxRotation)) {
        if (rotate(mainGridBounds, mainGridSpaces, pieceRef, db.takenSpaces, db.piece.maxRotation, -blockSize)) {
          db.coord.x -= blockSize
        } else if (rotate(mainGridBounds, mainGridSpaces, pieceRef,db.takenSpaces, db.piece.maxRotation, blockSize)) {
          db.coord.x += blockSize
        } else if (rotate(mainGridBounds, mainGridSpaces, pieceRef, db.takenSpaces, db.piece.maxRotation, -2 * blockSize)) {
          db.coord.x += -2 * blockSize
        } else if (rotate(mainGridBounds, mainGridSpaces, pieceRef, db.takenSpaces, db.piece.maxRotation, 2 * blockSize)) {
          db.coord.x += 2 * blockSize
        }
      }
    }

    const ghostPiece = () => {
      let offsetY = blockSize - ((db.coord.y + db.initY) % blockSize)
      if (!movingDown(offsetY)) {
        db.redrawGhostPiece = false
        return
      }
      
      while (movingDown(offsetY + blockSize)) {
        offsetY += blockSize
      }

      const blocks = pieceRef.current.children
      const blocksBounds = []
      for (let i = 0; i < blocks.length; i++) {
        blocksBounds.push(blocks[i].getBoundingClientRect())
      }

      db.ghostBlocks.forEach(i => {
        mainGridSpaces[i].classList.add('grid-space')
        mainGridSpaces[i].classList.remove('ghost-piece')
        mainGridSpaces[i].style.border = ''
      })
      db.ghostBlocks = []

      const ghostBlockSpaces = blocksBounds.map(blockBounds => {
        const blockBoundsY = [blockBounds.top + 2, (blockBounds.top + blockBounds.bottom) / 2, blockBounds.bottom - 2].map(n => n + offsetY)
        let ghostPiece
        for (let i = 0; i < mainGridSpaces.length; i++) {
          const spaceBounds = mainGridSpaces[i].getBoundingClientRect()
          if (spaceBounds.top > blockBounds.bottom + offsetY) {
            i += 11 - (i % 12)
            continue
          }

          if (spaceBounds.left !== blockBounds.left) {
            continue
          }
          
          if (blockBoundsY.some(n => n > spaceBounds.top && n <= spaceBounds.bottom)) {
            ghostPiece = mainGridSpaces[i]
            db.ghostBlocks.push(i)
            break
          }
        }
        return ghostPiece
      })

      if (ghostBlockSpaces.some(space => !space)) {
        db.redrawGhostPiece = false
        return
      }

      ghostBlockSpaces.forEach(space => {
        space.classList.remove('grid-space')
        space.classList.add('ghost-piece')
        space.style.border = `2px solid ${db.piece.color}`
      })
      
      db.redrawGhostPiece = false
    }

    // STOP PIECE FROM FALLING ON VERTICAL COLLISION
    const stopDroppingOnCollision = () => {
      const blocks = pieceRef.current.children
      const blocksBounds = []
      for (let i = 0; i < blocks.length; i++) {
        blocksBounds.push(blocks[i].getBoundingClientRect())
      }

      blocksBounds.forEach(blockBounds => {
        let takenSpace
        const blockBoundsX = [blockBounds.left + 2, (blockBounds.right + blockBounds.left) / 2, blockBounds.right - 2]
        const blockBoundsY = [blockBounds.top + 2, (blockBounds.top + blockBounds.bottom) / 2, blockBounds.bottom - 2]

        for(let i = 0; i < mainGridSpaces.length; i++) {
          if (db.takenSpaces.includes(i)) {
            continue
          }

          const spaceBounds = mainGridSpaces[i].getBoundingClientRect()
          if (spaceBounds.top > blockBounds.bottom) {
            i += 11 - (i % 12)
            continue
          }

          if (!blockBoundsX.some(n => n > spaceBounds.left && n <= spaceBounds.right)) {
            continue
          }
          
          if (blockBoundsY.some(n => n > spaceBounds.top && n <= spaceBounds.bottom)) {
            takenSpace = mainGridSpaces[i]
            takenSpace.classList.add('taken', db.piece.color);
            db.takenSpaces.push(i)
            break
          }
        }
      })
            
      clearInterval(refreshCycle)
      db.inputLock = true
      delete db.fallBufferTimeout
      db.ghostBlocks.forEach(i => {
        mainGridSpaces[i].classList.add('grid-space')
        mainGridSpaces[i].classList.remove('ghost-piece')
        mainGridSpaces[i].style.border = ''
      })
      db.ghostBlocks = []
      const numOfLines = destroyLines(mainGridRef)
      incrementScore(scoreChart[numOfLines])
      db.destroyedLines += numOfLines
      db.takenSpaces.sort((a, b) => b - a)
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
        } else {
          clearTimeout(db.fallBufferTimeout)
          stopDroppingOnCollision()
        }
      }, 6 * frame)
    }

    // DESTROY COMPLETE LINES AFTER PIECE HAVE DROPPED
    const destroyLines = () => {
      let count = 0
      for (let i = 0; i < mainGridSpaces.length - 12; i += 12) {
        const indexes = []
        for (let j = i; j < i + 12; j++) {
          indexes.push(j)
        }
        if (indexes.every(n => db.takenSpaces.includes(n))) {
          count += 1
          const previousSpaces = []
          for (let k = 0; k < i + 12; k++) {
            previousSpaces.push(mainGridSpaces[k])
          }

          previousSpaces.reverse().forEach((space, j) => {
            space.className = mainGridSpaces[i - j - 1] ? mainGridSpaces[i - j - 1].className : 'grid-space'
          })
        }
      }

      if (count) {
        db.takenSpaces = []
        db.ghostBlocks = []
        for (let i = 0; i < mainGridSpaces.length; i++) {
          if (mainGridSpaces[i].classList.contains('taken')) {
            db.takenSpaces.push(i)
          }
        }
      }
      return count
    }
          
    // EXECUTE INPUTS FROM BUFFER EVERY FRAME WHEN NO COLLISION DETECTED
    const executeInputs = () => {
      if (db.inputLock) {
        return
      }

      const inputs = db.shortPush.concat(db.longPush)
      const blocks = pieceRef.current.children
      const positionIndex = []
      for (let i = 0; i < blocks.length; i++) {
        const blockBounds = blocks[i].getBoundingClientRect()
        const coordX = Math.floor((blockBounds.left - mainGridBounds.left) / blockSize)
        const coordY = Math.floor((blockBounds.top - mainGridBounds.top + 2) / blockSize) * 12
        const coordYBottom = Math.floor((blockBounds.bottom - mainGridBounds.top - 2) / blockSize) * 12
        positionIndex.push({ top: coordX + coordY, bottom: coordX + coordYBottom })
      }

      if (inputs.includes(' ')) {
        rotation()
        db.redrawGhostPiece = true
      }
      
      if (inputs.includes("ArrowLeft")) {
        let collision
        for (let i = 0; i < positionIndex.length; i++) {
          const index = positionIndex[i]
          if (db.takenSpaces.includes(index.top - 1) || db.takenSpaces.includes(index.bottom - 1) || index.top % 12 === 0) {
            collision = true
            break
          }
        }
        if (!collision) {
          db.coord.x -= blockSize
          db.redrawGhostPiece = true
          positionIndex.forEach(index => {
            index.top -= 1
            index.bottom -= 1
          })
        }
      } else if (inputs.includes("ArrowRight")) {
        let collision
        for (let i = 0; i < positionIndex.length; i++) {
          const index = positionIndex[i]
          if (db.takenSpaces.includes(index.top + 1) || db.takenSpaces.includes(index.bottom + 1) || (index.top + 1) % 12 === 0) {
            collision = true
            break
          }
        }
        if (!collision) {
          db.coord.x += blockSize
          db.redrawGhostPiece = true
          positionIndex.forEach(index => {
            index.top += 1
            index.bottom += 1
          })
        }
      }
      
      if (inputs.includes('ArrowDown')) {
        let collision
        for (let i = 0; i < positionIndex.length; i++) {
          const index = positionIndex[i]
          if (db.takenSpaces.includes(index.bottom + 12) || index.top + 12 >= 264) {
            collision = true
            break
          }
        }
        if (!collision) {
          positionIndex.forEach(index => {
            index.top += 12
            index.bottom += 12
          })
          db.coord.y += mainGridSpaces[positionIndex[0].top].getBoundingClientRect().top - blocks[0].getBoundingClientRect().top
        } else {
          stopDroppingOnCollision()
        }
      } else {
        const rate = blockSize / (dropSpeed / frame)
        
        let collision
        if ((db.coordY % blockSize) + rate >= blockSize) {
          for (let i = 0; i < positionIndex.length; i++) {
            const index = positionIndex[i]
            if (db.takenSpaces.includes(index.bottom + 12) || index.top + 12 >= 264) {
              collision = true
              break
            }
          }
        }

        if (!collision) {
          db.coord.y += rate
        } else {
          stopDroppingOnCollision()
        }
      }
      
      db.shortPush = []
    }

    const refreshCycle = setInterval(() => {
      if (pieceBlocks && db.piece) {
        executeInputs()
        drawPiece()
        if (db.redrawGhostPiece) {
          ghostPiece()
        }
      }
    }, frame)
    
    if (gameActive && pieceBlocks) {
      drawPiece()
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
    frame,
    incrementScore,
    level,
    setLevel
  ])


  const renderedGridSpaces = () => {
    const gridSpaces = []
    for (let y = 0; y < 22; y += 1) {
      for (let x = 0; x < 12; x += 1) {
        gridSpaces.push(
          <div className="grid-space" key={`${x}, ${y}`}>
            <div className='front face'></div>
            <div className='back face'></div>
            <div className='left face'></div>
            <div className='right face'></div>
            <div className='top face'></div>
            <div className='bottom face'></div>
          </div>
        )
      }
    }
  
    return gridSpaces
  }

  return (
    <div ref={mainGridRef} className="main-grid" onClick={() => setGameActive(true)}>
      {renderedGridSpaces()}
      <div ref={pieceRef} className='blocks active-block'>
        {pieceBlocks}
      </div>
    </div>
  )
}

export default MainGrid