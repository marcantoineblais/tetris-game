import React, { useEffect, useRef, useState } from "react"
import { createPieces } from "./gameAssets.js/pieces"
import { wait } from "../helpers"

const MainGrid = ({ container }) => {

  const [blockSize, setBlockSize] = useState(null) 
  const [fallSpeed, setFallSpeed] = useState(100) 
  const [activePiece, setActivePiece] = useState(createPieces().straightPiece)
  const [renderedActivePiece, setRenderedActivePiece] = useState(null)
  const [activePieceCoord, setActivePieceCoord] = useState(null)
  const [activePieceFalling, setActivePieceFalling] = useState(true)
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


  // RENDER ACTIVE PIECE
  useEffect(() => {
    if (!blockSize || !activePiece) {
      return
    }

    const renderedBlocks = []
    const blockCoordinates = []
    activePiece.coordinates.forEach((baseCoord, i) => {
      const coord = {
        x: baseCoord.x * blockSize,
        y: baseCoord.y * blockSize
      }
      const style = {
        width: blockSize.toString() + 'px',
        height: blockSize.toString() + 'px',
        left: coord.x.toString() + 'px',
        top: coord.y.toString() + 'px'
      }
      const block = <div className={'active-block ' + activePiece.color} style={style} key={i}></div>
      renderedBlocks.push(block)
      blockCoordinates.push(coord)
    })

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


  // UPDATE ACTIVE PIECE POSITION
  useEffect(() => {
    if (!activePieceCoord || !activePieceRef.current || !activePieceFalling) {
      return
    }

    [].slice.call(activePieceRef.current.children).forEach((block, i) => {
      block.style.top = activePieceCoord[i].y.toString() + 'px'
    })
  }, [activePieceCoord, activePieceRef, activePiece, activePieceFalling])

  // FIX STOPPED PIECE POSITION
  useEffect(() => {
    if (activePieceFalling || !activePiece) {
      return
    }

    [].slice.call(activePieceRef.current.children).forEach((block) => {
      const currentSpace = block.getBoundingClientRect()
      const coord = {
        x: (currentSpace.left + currentSpace.right) / 2,
        y: (currentSpace.top + currentSpace.bottom) / 2
      };

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

    setActivePiece(null)
    setRenderedActivePiece(null)
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