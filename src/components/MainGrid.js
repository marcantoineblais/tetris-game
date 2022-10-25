import React, { useEffect, useRef, useState } from "react"
import { spawnPiece, renderedPiece } from "./assets.js"
import { wait } from "../helpers"

const MainGrid = ({ container }) => {

  const [blockSize, setBlockSize] = useState(null) 
  const [fallSpeed, setFallSpeed] = useState(100) 
  const [activePiece, setActivePiece] = useState(null)
  const [renderedActivePiece, setRenderedActivePiece] = useState(null)
  const [activePieceCoord, setActivePieceCoord] = useState(null)
  const [activePieceFalling, setActivePieceFalling] = useState(false)
  const mainGridRef = useRef()
  const activePieceRef = useRef()


  // SET GRID SIZE AND EVENT LISTENER
  useEffect(() => {
    const setMainGridSpacesDimensions = () => {
      const mainGrid = mainGridRef.current
      mainGrid.style.width = container.current.clientWidth > 600 ? '600px' : container.current.clientWidth + 'px'
      let dimension
      if (mainGrid.clientWidth < mainGrid.clientHeight && mainGrid.clientHeight <= container.current.clientHeight) {
        dimension = (mainGrid.clientWidth / 12).toString()
        mainGrid.style.height = (dimension * 22).toString() + 'px'
      } else {
        dimension = (mainGrid.clientHeight / 22).toString()
        mainGrid.style.width = (dimension * 12).toString() + 'px'
      }
      const mainGridSpaces = [].slice.call(mainGridRef.current.children)
      mainGridSpaces.forEach(el => {
        el.style.width = dimension + 'px'
        el.style.height = dimension + 'px'
      })
      setBlockSize(dimension)
    }

    setMainGridSpacesDimensions()
    window.addEventListener('resize', setMainGridSpacesDimensions)

    return () => {
      window.removeEventListener('resize', setMainGridSpacesDimensions)
    }
  }, [container])

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

    const [renderedBlocks, blockCoordinates] = renderedPiece(activePiece, blockSize)
    
    setRenderedActivePiece(
      <div ref={activePieceRef} style={{ position: 'absolute'}}>
        {renderedBlocks}
      </div>
    )
    
    setActivePieceCoord(blockCoordinates)
  }, [blockSize, activePiece])


  // ACTIVE PIECE FALL TIMER
  useEffect(() => {
    if (!activePiece || !activePieceFalling || !activePieceCoord) {
      return
    }

    const checkForCollision = (coord) => {
      if (coord.y === mainGridRef.current.clientHeight - blockSize - 1 ) {
        setActivePieceFalling(false)
        return true
      }
  
      return false
    }

    const fall = async () => {
      await wait(fallSpeed / blockSize)
      const newCoord = []
      activePieceCoord.forEach((coord) => {
        const collision = checkForCollision(coord)
        if (!collision) {
          newCoord.push({ x: coord.x, y: coord.y + 1 })
        }
      })
      setActivePieceCoord(newCoord)
    }
    if (activePieceFalling) {
      fall()
    }
  }, [activePieceCoord, activePiece, activePieceFalling, blockSize, fallSpeed, container])


  // START ACTIVE PIECE FALL TIMER
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

  // UPDATE ACTIVE PIECE POSITION
  useEffect(() => {
    if (!activePieceCoord || !renderedActivePiece || !activePieceFalling) {
      return
    }

    [].slice.call(activePieceRef.current.children).forEach((block, i) => {
      block.style.top = activePieceCoord[i].y.toString() + 'px'
    })
  }, [activePieceCoord, activePieceRef, activePiece, activePieceFalling, renderedActivePiece])

  // FIX STOPPED PIECE POSITION
  useEffect(() => {
    if (activePieceFalling || !activePiece || !activePieceRef.current) {
      return
    }

    const resetPiece = () => {
      setActivePiece(null)
      setRenderedActivePiece(null)
      setActivePieceCoord(null)
      setActivePieceCoord(null)
    }

    [].slice.call(activePieceRef.current.children).forEach((block) => {
      const currentSpace = block.getBoundingClientRect()
      const coord = {
        x: (currentSpace.left + currentSpace.right) / 2,
        y: (currentSpace.top + currentSpace.bottom) / 2
      }

      const takenSpace = [].slice.call(mainGridRef.current.children).filter((space) => {
        const spaceRect = space.getBoundingClientRect()
        return (
          spaceRect.left < coord.x && spaceRect.right > coord.x &&
          spaceRect.top < coord.y && spaceRect.bottom > coord.y &&
          !space.classList.contains('active-block')
        )
      }).pop()
      takenSpace.classList.add('taken', activePiece.color)
    })

    resetPiece()

  }, [activePieceFalling, activePiece])

  const renderedGridSpaces = () => {
    const gridSpaces = []
    for (let y = 0; y < 22; y += 1) {
      for (let x = 0; x < 12; x += 1) {
        gridSpaces.push(<div id={`${x}, ${y}`} className="grid-space empty" key={`${x}, ${y}`}></div>)
      }
    }

    return gridSpaces
  }

  return (
    <div ref={mainGridRef} className="main-grid">
      {renderedGridSpaces()}
      {renderedActivePiece}
    </div>
  )
}

export default MainGrid