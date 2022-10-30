import React, { useEffect, useRef, useState } from "react"
import { spawnPiece } from "./assets"
import { wait } from "../helpers"
import useDestroyLines from "./mouvements/useDestroyLines"
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
  const [inputBuffer, setInputBuffer] = useState([])
  const [destroyedLines, setDestroyedLines, destroyLines] = useDestroyLines(0)

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


  // EXECUTE INPUTS IN INPUTBUFFER EVERY FRAME
  useEffect(() => {

    const renderPiece = (piece) => {
     
      const renderedBlocks = []
      piece.coordinates.forEach((baseCoord, i) => {
        const coordX = baseCoord.x * blockSize
        const coordY = baseCoord.y * blockSize
        
        const style = {
          width: blockSize.toString() + 'px',
          height: blockSize.toString() + 'px',
          left: coordX.toString() + 'px',
          top: coordY.toString() + 'px'
        }
        const block = <div className={'active-block ' + piece.color} style={style} key={i}></div>
        renderedBlocks.push(block)
      })
  
      const coordX = piece.center.x * blockSize
      const coordY = piece.center.y * blockSize
      const top = coordY.toString() + 'px'
      const left = coordX.toString() + 'px'
    }

    const drawPiece = () => {
      activePieceRef.current.style.left = activePieceCoordX.toString() + 'px'
      activePieceRef.current.style.top = activePieceCoordY.toString() + 'px'
    }

    const movingDown = async (rate = dropRate) => {
      if (moveDown(mainGridRef, activePieceRef)) {
        setActivePieceCoordY(activePieceCoordY + rate)
      } else {
        await wait(6 * frame)
        if (moveDown(mainGridRef, activePieceRef)) {
          setActivePieceCoordY(activePieceCoordY + rate)
        } else {
          setActivePieceFalling(false)
          stopDroppingOnCollision()
        }
      }
    }

    const movingRight = () => {
      if (moveRight(mainGridRef, activePieceRef)) {
        setActivePieceCoordX(activePieceCoordX + blockSize)
      }
    }

    const movingLeft = () => {
      if (moveLeft(mainGridRef, activePieceRef)) {
        setActivePieceCoordX(activePieceCoordX - blockSize)
      }
    }

    const rotation = () => {
      if (!rotate(mainGridRef, activePieceRef)) {
        if (rotate(mainGridRef, activePieceRef, -blockSize)) {
          setActivePieceCoordX(activePieceCoordX - blockSize)
        } else if (rotate(mainGridRef, activePieceRef, blockSize)) {
          setActivePieceCoordX(activePieceCoordX + blockSize)
        } else if (rotate(mainGridRef, activePieceRef, -2 * blockSize)) {
          setActivePieceCoordX(activePieceCoordX + (-2 *blockSize))
        } else if (rotate(mainGridRef, activePieceRef, 2 * blockSize)) {
          setActivePieceCoordX(activePieceCoordX + (2 * blockSize))
        }
      }
    }

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
      
      destroyLines(mainGridRef)
    }

    const executeInputs = () => {
      inputBuffer.forEach(input => {
        switch(input) {
          case 'ArrowLeft':
            movingLeft()
            break
          case 'ArrowRight':
            movingRight()
            break
          case 'ArrowDown':
            const rate = (activePieceCoordY % blockSize) - mainGridRef.current.getBoundingClientRect().top || blockSize
            movingDown(rate)
            break
          case ' ':
            rotation()
            setInputBuffer(inputBuffer.filter(key => key !== ' '))  
            break
          default:
            break
        }
      })
    }

    const refreshCycle = setInterval(() => {
      drawPiece()
      executeInputs()
    }, frame)

    const makePieceDrop = setInterval(() => {
      movingDown()
    }, dropSpeed / frame)

    return () => {
      clearInterval(refreshCycle)
      clearInterval(makePieceDrop)
    }
  }, [inputBuffer, activePieceFalling, activePieceCoordX, activePieceCoordY, blockSize, dropSpeed, dropRate, renderedActivePiece, activePiece, destroyLines])


  // SPAWN RANDOM PIECE
  useEffect(() => {
    if (activePiece) {
      return
    }

    setActivePiece(spawnPiece())
  }, [activePiece])


  // RENDER ACTIVE PIECE
  useEffect(() => {
    if (!blockSize || !activePiece) {
      return
    }

    

    setActivePieceCoordX(coordX)
    setActivePieceCoordY(coordY)
    
  }, [activePiece, blockSize])


  // START DROPPING ACTIVE PIECE AFTER RENDER
  useEffect(() => {
    if (!renderedActivePiece || activePieceFalling) {
      return
    }

    const startToFall = async () => {
      await wait(500)
      setActivePieceFalling(true)
    }

    startToFall()
  }, [renderedActivePiece, activePieceFalling])


  // DEFINE INPUTBUFFER EVENT LISTENER
  useEffect(() => {

    
    const onKeyDown = (e) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', ' ', 'p', 'm']
      if (keys.includes(e.key) && !inputBuffer.includes(e.key)) {
        setInputBuffer([...inputBuffer, e.key])
      }
    }

    const onKeyUp = (e) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowDown']
      if (keys.includes(e.key)) {
        setInputBuffer(inputBuffer.filter(key => key !== e.key))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [inputBuffer])


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