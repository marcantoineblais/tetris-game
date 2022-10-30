import React, { useEffect, useRef, useState } from "react"
import parse from "html-react-parser"
import { spawnPiece } from "./assets"
import { wait } from "../helpers"
import destroyLines from "./mouvements/destroyLines"
import moveLeft from "./mouvements/moveLeft"
import moveRight from "./mouvements/moveRight"
import moveDown from "./mouvements/moveDown"
import rotate from "./mouvements/rotate"

const MainGrid = ({ container }) => {

  // width and height of a block
  const [blockSize, setBlockSize] = useState(null)
  
  // num of milliseconds to fall 1 block
  const [dropSpeed, setDropSpeed] = useState(750)
  // num of pixels fall per cycle
  const [dropRate, setDropRate] = useState(1)
  
  const frame = 16.6
  const mainGridRef = useRef()
  const pieceRef = useRef()


  // SET GRID SIZE AND EVENT LISTENER
  useEffect(() => {
    const setMainGridSpacesDimensions = () => {
      const mainGrid = mainGridRef.current
      mainGrid.style.width = container.current.clientWidth > 600 ? '600px' : container.current.clientWidth + 'px'
      let dimension
      if (mainGrid.clientWidth < mainGrid.clientHeight && mainGrid.clientHeight <= container.current.clientHeight) {
        dimension = Math.floor(mainGrid.clientWidth / 120) * 10
        mainGrid.style.width = (dimension * 12).toString() + 'px'
        mainGrid.style.height = (dimension * 22).toString() + 'px'
      } else {
        dimension = Math.floor(mainGrid.clientHeight / 220) * 10
        mainGrid.style.width = (dimension * 12).toString() + 'px'
        mainGrid.style.height = (dimension * 22).toString() + 'px'
      }
      const mainGridSpaces = [].slice.call(mainGridRef.current.children)
      mainGridSpaces.forEach(el => {
        el.style.width = dimension.toString() + 'px'
        el.style.height = dimension.toString() + 'px'
      })
      setBlockSize(dimension)
    }
    
    setMainGridSpacesDimensions()
    window.addEventListener('resize', setMainGridSpacesDimensions)
    
    return () => {
      window.removeEventListener('resize', setMainGridSpacesDimensions)
    }
  }, [container])
  

  
  useEffect(() => {
    
    // CREATE LOCAL DB IN BROWSER
    let db
    const request = window.indexedDB.open('gameData')
    request.onerror = (e) => {
      console.error('Please allow use of DB to play game')
    }
    request.onsuccess = (e) => {
      db = e.target.result
      db.inputBuffer = []
      db.score = 0
      db.destroyedLines = 0
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
    

    // RENDER NEW PIECE
    const renderPiece = (piece) => {
      
      piece.coordinates.forEach((coord, i) => {
        const coordX = coord.x * blockSize
        const coordY = coord.y * blockSize
        
        const style = {
          width: blockSize.toString() + 'px',
          height: blockSize.toString() + 'px',
          left: coordX.toString() + 'px',
          top: coordY.toString() + 'px'
        }
        const block = <div className={'active-block ' + piece.color} style={style} key={i}>{}</div>
        pieceRef.current.insertAdjacentHTML('beforeend', block)
      })
      
      const coordX = piece.center.x * blockSize
      const coordY = piece.center.y * blockSize
      const top = coordY.toString() + 'px'
      const left = coordX.toString() + 'px'
      
      pieceRef.current.style.top = top
      pieceRef.current.style.left = left
    }
    
    const drawPiece = (coord) => {
      pieceRef.current.style.left = coord.x.toString() + 'px'
      pieceRef.current.style.top = coord.y.toString() + 'px'
    }
    

    // CHECKS FOR MOVEMENT AND COLLISIONS
    const movingDown = async (rate = dropRate) => {
      if (moveDown(mainGridRef, pieceRef)) {
        return true
      } else {
        await wait(6 * frame)
        if (moveDown(mainGridRef, pieceRef)) {
          return true
        } else {
          return false
        }
      }
    }
    
    const movingRight = () => {
      return moveRight(mainGridRef, pieceRef)
    }
    
    const movingLeft = () => {
      return moveLeft(mainGridRef, pieceRef)
    }

    const rotation = (coordX) => {
      if (!rotate(mainGridRef, pieceRef)) {
        if (rotate(mainGridRef, pieceRef, -blockSize)) {
          return coordX -= blockSize
        } else if (rotate(mainGridRef, pieceRef, blockSize)) {
          return coordX += blockSize
        } else if (rotate(mainGridRef, pieceRef, -2 * blockSize)) {
          return coordX += -2 * blockSize
        } else if (rotate(mainGridRef, pieceRef, 2 * blockSize)) {
          return coordX += 2 * blockSize
        }
      }
      return coordX
    }
    

    // STOP PIECE FROM FALLING ON VERTICAL COLLISION
    const stopDroppingOnCollision = () => {
      [].slice.call(pieceRef.current.children).forEach((block) => {
        const blockBounds = block.getBoundingClientRect()
        
        const takenSpace = [].slice.call(mainGridRef.current.children).filter((space) => {
          const spaceRect = space.getBoundingClientRect()
          return (
            spaceRect.left <= blockBounds.left && spaceRect.right >= blockBounds.right &&
            spaceRect.top <= blockBounds.top && spaceRect.bottom <= blockBounds.bottom &&
            !space.classList.contains('active-block')
            )
          }).pop()
          const color = pieceRef.current.children[0].style.backgroundColor
        takenSpace.classList.add('taken', color)
      })
      
      const numOfLines = destroyLines(mainGridRef)
      db.destroyedLines = numOfLines
    }
    

    // EXECUTE INPUTS FROM BUFFER EVERY FRAME WHEN NO COLLISION DETECTED
    const executeInputs = () => {
      const coord = {
        x: parseInt(pieceRef.current.style.left),
        y: parseInt(pieceRef.current.style.top)
      }
      db.inputBuffer.forEach(input => {
        switch(input) {
          case 'ArrowLeft':
            if (movingLeft())
            coord.x -= blockSize
            break
            case 'ArrowRight':
              if (movingRight()) {
              coord.x += blockSize
            }
            break
          case 'ArrowDown':
            const rate = (coord.y % blockSize) - mainGridRef.current.getBoundingClientRect().top || blockSize
            if (movingDown(rate)) {
              coord.y += rate
            }
            break
          case ' ':
            coord.x = rotation(coord.x)
            db.inputBuffer = db.inputBuffer.filter(key => key !== ' ')  
            break
          default:
            break
        }
      })

      drawPiece(coord)
    }
    

    const refreshCycle = setInterval(() => {
      if (!db.piece) {
        renderPiece(spawnPiece())
      }
      if (pieceRef.current.innerHTML) {
        executeInputs()
      }
    }, frame)
    

    // MAKE PIECE FALL EVERY FRAME FOR 1 SPACE EVERY DROPSPEED TIME (MILLISECONDS)
    const makePieceDrop = setInterval(() => {
      movingDown()
    }, dropSpeed / frame)
    
    return () => {
      clearInterval(refreshCycle)
      clearInterval(makePieceDrop)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [blockSize, dropRate, dropSpeed])
  

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
    <div ref={mainGridRef} className="main-grid">
      {renderedGridSpaces()}
      <div ref={pieceRef} className="active-container" style={{ position: 'absolute'}}></div>
    </div>
  )
}

export default MainGrid