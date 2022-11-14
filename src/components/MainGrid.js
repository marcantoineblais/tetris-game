import React, { useEffect, useRef, useState } from "react"
import { spawnPiece } from "./assets"
import moveDown from "./mouvements/moveDown"

const MainGrid = ({ 
  container,
  db,
  blockSize,
  setBlockSize,
  setNextPiece,
  incrementScore,
  setLevel,
  level,
  blockStyle,
  setBlockStyle
}) => {
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

      setBlockStyle({
        front: { transform: `translateZ(${dimension / 2}px)` },
        back: { transform: `rotateY(180deg) translateZ(${dimension / 2}px)` },
        left: { transform: `rotateY(-90deg) translateZ(${dimension / 2}px)` },
        right: { transform: `rotateY(90deg) translateZ(${dimension / 2}px)` },
        top: { transform: `rotateX(90deg) translateZ(${dimension / 2}px)` },
        bottom: { transform: `rotateX(-90deg) translateZ(${dimension / 2}px)` }
      })

      document.body.style.fontSize = `${dimension / 4}px`
    }
    
    setMainGridSpacesDimensions()
    window.addEventListener('resize', setMainGridSpacesDimensions)
    
    return () => {
      window.removeEventListener('resize', setMainGridSpacesDimensions)
    }
  }, [container, setBlockSize, setBlockStyle])
  

  useEffect(() => {
    if (!db || pieceBlocks) {
      return
    }

    // RENDER NEW PIECE
    const renderPiece = (piece) => {
      const blocks = piece.coordinates.map((coord, i) => {
        const coordX = coord.x * blockSize
        const coordY = coord.y * blockSize
        
        const mainStyle = {
          width: blockSize.toString() + 'px',
          height: blockSize.toString() + 'px',
          left: coordX.toString() + 'px',
          top: coordY.toString() + 'px',
          borderColor: 'rgba(0, 0, 0, 0.1)'
        }

        return (
          <div className={"block piece " + piece.color} style={mainStyle} key={i}>
            <div className='face' style={blockStyle.front}></div> 
            <div className='face' style={blockStyle.back}></div>
            <div className='face' style={blockStyle.left}></div>
            <div className='face' style={blockStyle.right}></div>
            <div className='face' style={blockStyle.top}></div>
            <div className='face' style={blockStyle.bottom}></div>
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
  }, [db, pieceBlocks, blockSize, setNextPiece, blockStyle])
  
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
    const movingDown = (rate, offsetX = 0) => {
      return moveDown(mainGridBounds, mainGridSpaces, pieceRef, db.takenSpaces, rate, offsetX)
    }
    
    const ghostPiece = (positionIndex) => {
      db.ghostBlocks.forEach(i => {
        mainGridSpaces[i].classList.add('grid-space')
        mainGridSpaces[i].classList.remove('ghost-piece')
        mainGridSpaces[i].style.border = ''
      })
      db.ghostBlocks = []

      let collision
      while (!collision) {
        for (let i = 0; i < positionIndex.length; i++) {
          const index = positionIndex[i]
          if (db.takenSpaces.includes(index.top + 12) || index.top + 12 >= 264) {
            collision = true
            break
          }
        }
        if (!collision) {
          positionIndex.forEach(index => index.top += 12)
        }
      }

      positionIndex.forEach(index => {
        db.ghostBlocks.push(index.top)
        mainGridSpaces[index.top].classList.remove('grid-space')
        mainGridSpaces[index.top].classList.add('ghost-piece')
        mainGridSpaces[index.top].style.border = `2px solid ${db.piece.color}`
      })
    }

    // STOP PIECE FROM FALLING ON VERTICAL COLLISION
    const stopDroppingOnCollision = (positionIndex) => {
      db.inputLock = true
      clearInterval(refreshCycle)
      delete db.fallBufferTimeout

      db.ghostBlocks.forEach(index => {
        mainGridSpaces[index].classList.add('grid-space')
        mainGridSpaces[index].classList.remove('ghost-piece')
        mainGridSpaces[index].style.border = ''
      })
      db.ghostBlocks = []

      positionIndex.forEach(index => {
        db.takenSpaces.push(index.bottom)
        mainGridSpaces[index.bottom].classList.add('taken', db.piece.color)
      })     
      
      const numOfLines = destroyLines(mainGridRef)
      db.destroyedLines += numOfLines
      incrementScore(scoreChart[numOfLines])
      setLevel(Math.floor(db.destroyedLines / 10))
      
      if (levelChart[level]) {
        setDropSpeed(levelChart[level])
      }
      setPieceBlocks(null)
    }

    // BUFFER PERIOD TO MOVE A PIECE ONCE IT LANDED
    const beforeCollision = (positionIndex) => {
      if (db.fallBufferTimeout) {
        return
      }

      db.fallBufferTimeout = setTimeout(() => {

        stopDroppingOnCollision(positionIndex)
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
      const afterRotationIndex = []
      let rotation
      if (inputs.includes(' ')) {
        const currentRotation = pieceRef.current.style.transform
        const rotDeg = parseInt(currentRotation.split('(')[1])
        pieceRef.current.style.transform = `rotate(${(rotDeg + 90) % db.piece.maxRotation}deg)`
        const blocks = pieceRef.current.children
    
        for (let i = 0; i < blocks.length; i++) {
          const blockBounds = blocks[i].getBoundingClientRect()
          let coordX = Math.floor((blockBounds.left - mainGridBounds.left) / blockSize)
          const coordYTop = Math.floor((blockBounds.top + 2 - mainGridBounds.top) / blockSize) * 12
          const coordYBottom = Math.floor((blockBounds.bottom - 2 - mainGridBounds.top) / blockSize) * 12
          afterRotationIndex.push({ top: coordX + coordYTop, bottom: coordX + coordYBottom })
        }
        
        let collision
        const offsets = [0, 1, -1, 2, -2]
        for (let n = 0; n < offsets.length; n++) {
          collision = false
          const offset = offsets[n]
          
          if (
            (offset < 0 && db.coord.x < (5 * blockSize)) ||
            (offset > 0 && db.coord.x > (7 * blockSize))
          ) {
            continue
          }

          const outOfBounds = (afterRotationIndex.some(index => (index.top + offset) % 12 === 0) && afterRotationIndex.some(index => (index.top + offset) % 12 === 11))
          for (let i = 0; i < blocks.length; i++) {
            const index = afterRotationIndex[i]
            if (db.takenSpaces.includes(index.top + offset) || db.takenSpaces.includes(index.bottom + offset) || outOfBounds)  {
              collision = true
              break
            }
          }

          if (!collision) {
            afterRotationIndex.forEach(index => {
              index.top += offset
              index.bottom += offset
            })
            break
          }
        }

        if (collision) {
          pieceRef.current.style.transform = currentRotation
        } else {
          const newSpace = mainGridSpaces[afterRotationIndex[0].top].getBoundingClientRect()
          db.coord.x += newSpace.left - pieceRef.current.children[0].getBoundingClientRect().left
          rotation = true
        }
      }
      
      let positionIndex = []
      const blocks = pieceRef.current.children
      if (rotation) {
        positionIndex = afterRotationIndex
      } else {
        for (let i = 0; i < blocks.length; i++) {
          const blockBounds = blocks[i].getBoundingClientRect()
          const coordX = Math.floor((blockBounds.left - mainGridBounds.left) / blockSize)
          const coordY = Math.floor((blockBounds.top - mainGridBounds.top + 2) / blockSize) * 12
          const coordYBottom = Math.floor((blockBounds.bottom - mainGridBounds.top - 2) / blockSize) * 12
          positionIndex.push({ top: coordX + coordY, bottom: coordX + coordYBottom })
        }
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
          if (db.takenSpaces.includes(index.bottom + 12) || index.bottom + 12 >= 264) {
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
          stopDroppingOnCollision(positionIndex)
        }
      } else {
        const position = db.coord.y + db.initY
        let rate = blockSize / (dropSpeed / frame)
        
        let collision
        let updatedIndex = 0
        if ((position % blockSize) + rate >= blockSize) {
          rate = blockSize - (position % blockSize)
        } else if (position % blockSize === 0) {
          updatedIndex = 12
          for (let i = 0; i < positionIndex.length; i++) {
            const index = positionIndex[i]
            if (db.takenSpaces.includes(index.bottom + 12) || index.bottom + 12 >= 264) {
              collision = true
              break
            }
          }
        }
        if (!collision) {
          db.coord.y += rate
          positionIndex.forEach(index => {
            index.top += updatedIndex
            index.bottom += updatedIndex
          })
        } else {
          stopDroppingOnCollision(positionIndex)
        }
      }
      
      ghostPiece(positionIndex)
      db.shortPush = []
    }

    const refreshCycle = setInterval(() => {
      if (pieceBlocks && db.piece) {
        executeInputs()
        drawPiece()
      }
    }, frame)
    
    if (gameActive && pieceBlocks) {
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
            <div className='face' style={blockStyle.front}></div>
            <div className='face' style={blockStyle.back}></div>
            <div className='face' style={blockStyle.left}></div>
            <div className='face' style={blockStyle.right}></div>
            <div className='face' style={blockStyle.top}></div>
            <div className='face' style={blockStyle.bottom}></div>
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