import React, { useEffect, useRef, useState } from "react"
import { spawnPiece, renderedPiece } from "./assets.js"
import { promise, wait } from "../helpers"

const MainGrid = ({ container }) => {

  // width and height of a block
  const [blockSize, setBlockSize] = useState(null)
  
  // num of milliseconds to fall 1 block
  const [fallSpeed, setFallSpeed] = useState(50)


  const [activePiece, setActivePiece] = useState(null)
  const [renderedActivePiece, setRenderedActivePiece] = useState(null)
  const [activePieceCoordX, setActivePieceCoordX] = useState(null)
  const [activePieceCoordY, setActivePieceCoordY] = useState(null)
  
  const [activePieceFalling, setActivePieceFalling] = useState(false)
  const [moveLeft, setMoveLeft] = useState(false)
  const [moveRight, setMoveRight] = useState(false)
  const [moveDown, setMoveDown] = useState(false)

  const [sideMovementInProgress, setSideMovementInProgress] = useState(false)
  const [fallingInProgress, setFallingInProgress] = useState(false)
  
  
  const mainGridRef = useRef()
  const activePieceRef = useRef()


  // SET GRID SIZE AND EVENT LISTENER
  useEffect(() => {
    const setMainGridSpacesDimensions = () => {
      const mainGrid = mainGridRef.current
      mainGrid.style.width = container.current.clientWidth > 600 ? '600px' : container.current.clientWidth + 'px'
      let dimension
      if (mainGrid.clientWidth < mainGrid.clientHeight && mainGrid.clientHeight <= container.current.clientHeight) {
        dimension = mainGrid.clientWidth / 12
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

    const [renderedBlocks, blockCoordinatesX, blockCoordinatesY] = renderedPiece(activePiece, blockSize)
    
    setRenderedActivePiece(
      <div ref={activePieceRef} style={{ position: 'absolute'}}>
        {renderedBlocks}
      </div>
    )

    setActivePieceCoordX(blockCoordinatesX)
    setActivePieceCoordY(blockCoordinatesY)
    
  }, [blockSize, activePiece])


  // START ACTIVE PIECE FALL TIMER
  useEffect(() => {
    if (!renderedActivePiece || activePieceFalling || fallingInProgress) {
      return
    }

    const startToFall = async () => {
      await wait(500)
      setActivePieceFalling(true)
    }

    startToFall()
  }, [renderedActivePiece, activePieceFalling, fallingInProgress])


  // ACTIVE PIECE FALL TIMER
  useEffect(() => {
    if (!activePiece || !activePieceFalling || !activePieceCoordY || fallingInProgress) {
      return
    }

    const checkForCollision = (blockBounds) => {
      const mainGridBounds = mainGridRef.current.getBoundingClientRect()
      if (blockBounds.bottom === mainGridBounds.bottom) {
        return true
      }

      let collision
      [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
        const spaceBounds = space.getBoundingClientRect()
        if (spaceBounds.top === blockBounds.bottom && spaceBounds.left <= blockBounds.left && spaceBounds.right >= blockBounds.right) {
          collision = true
        }
      })
  
      return collision
    }

    const setNewCoords = () => {
      const newCoordY = []
          activePieceCoordY.forEach((coordY) => {
          newCoordY.push(coordY + 1)
        })
      setActivePieceCoordY(newCoordY)
    }

    const fall = async () => {
      await wait(fallSpeed / blockSize)
      
      let collision
      [].slice.call(activePieceRef.current.children).forEach((block) => {
        if (checkForCollision(block.getBoundingClientRect())) {
          collision = true
        }
      })
      
      if (collision) {
        await wait(100)
        collision = false;
        [].slice.call(activePieceRef.current.children).forEach((block) => {
          if (checkForCollision(block.getBoundingClientRect())) {
            collision = true
          }
        })
        
        if (collision) {
          setActivePieceFalling(false)
        } else {
          setNewCoords()
        }

      } else {
        setNewCoords()
      }
      return promise()
    }

    const fallingProgress = async () => {
      setFallingInProgress(true)
      await fall()
      setFallingInProgress(false)
    }

    fallingProgress()
  }, [activePieceCoordY, activePieceCoordX, activePiece, activePieceFalling, blockSize, fallSpeed, fallingInProgress])


  // UPDATE ACTIVE PIECE POSITION
  useEffect(() => {
    if (!activePieceCoordY || !activePieceCoordX || !renderedActivePiece || !activePieceFalling || !activePiece) {
      return
    }

    [].slice.call(activePieceRef.current.children).forEach((block, i) => {
      block.style.left = activePieceCoordX[i].toString() + 'px'
      block.style.top = activePieceCoordY[i].toString() + 'px'
    })
  }, [activePieceCoordY, activePieceCoordX, activePieceRef, activePiece, activePieceFalling, renderedActivePiece])


  // DEFINE INPUTS BUFFER AND LISTENER
  useEffect(() => {
    if (!activePieceFalling) {
      return
    }

    const bufferInput = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          setMoveLeft(true)
          setMoveRight(false)
          break
        case 'ArrowRight':
          setMoveRight(true)
          setMoveLeft(false)
          break
        case 'ArrowDown':
          setMoveDown(true)
          break
        default:
          break;
      }
    }

    const manageKeyUpInput = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          setMoveLeft(false)
          break
        case 'ArrowRight':
          setMoveRight(false)
          break
        case 'ArrowDown':
          setMoveDown(false)
          break
        default:
          break;
      }
    }

    window.addEventListener('keydown', bufferInput)
    window.addEventListener('keyup', manageKeyUpInput)
    
    return () => {
      window.removeEventListener('keydown', bufferInput)
      window.removeEventListener('keyup', manageKeyUpInput)
    }
  }, [activePieceFalling])


  //LEFT MOVEMENT
  useEffect(() => {
    if (!moveLeft || sideMovementInProgress || !renderedActivePiece) {
      return
    }

    const checkForCollision = (blockBounds) => {
      const mainGridBounds = mainGridRef.current.getBoundingClientRect()
      if (blockBounds.left === mainGridBounds.left) {
        return true
      }

      let collision
      [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
        const spaceBounds = space.getBoundingClientRect()
        if (((spaceBounds.bottom >= blockBounds.bottom && spaceBounds.top < blockBounds.bottom) || 
             (spaceBounds.bottom > blockBounds.top && spaceBounds.top <= blockBounds.top)) &&
              spaceBounds.right === blockBounds.left) {
          collision = true
        }
      })
  
      return collision
    }

    const testingCollision = async () => {
      let collision
      [].slice.call(activePieceRef.current.children).forEach((block) => {
        if (checkForCollision(block.getBoundingClientRect())) {
          collision = true
        }
      })

      if (!collision) {
        const newCoordX = []
        activePieceCoordX.forEach(coordX => {
          newCoordX.push(coordX - blockSize)
        })
        setActivePieceCoordX(newCoordX)
        await wait(60)
      } else {
        await wait(fallSpeed / blockSize)
      }

      return promise()
    }
    
    const movingLeft = async () => {
      setSideMovementInProgress(true)
      await testingCollision()
      setSideMovementInProgress(false)
    }

    movingLeft()
  }, [moveLeft, activePieceCoordX, blockSize, sideMovementInProgress, fallSpeed, renderedActivePiece])


  //RIGHT MOVEMENT
  useEffect(() => {
    if (!moveRight || sideMovementInProgress || !renderedActivePiece) {
      return
    }

    const checkForCollision = (blockBounds) => {
      const mainGridBounds = mainGridRef.current.getBoundingClientRect()
      if (blockBounds.right === mainGridBounds.right) {
        return true
      }

      let collision
      [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
        const spaceBounds = space.getBoundingClientRect()
        if (((spaceBounds.bottom >= blockBounds.bottom && spaceBounds.top < blockBounds.bottom) ||
             (spaceBounds.bottom > blockBounds.top && spaceBounds.top <= blockBounds.top)) &&
              spaceBounds.left === blockBounds.right) {
          collision = true
        }
      })
  
      return collision
    }

    const testingCollision = async () => {
      let collision
      [].slice.call(activePieceRef.current.children).forEach((block) => {
        if (checkForCollision(block.getBoundingClientRect())) {
          collision = true
        }
      })

      if (!collision) {
        const newCoordX = []
        activePieceCoordX.forEach(coordX => {
          newCoordX.push(coordX + blockSize)
        })
        setActivePieceCoordX(newCoordX)
        await wait(60)
        setSideMovementInProgress(false)
      } else {
        await wait(fallSpeed / blockSize)
        setSideMovementInProgress(false)
      }
    }
    
    const movingRight = async () => {
      setSideMovementInProgress(true)
      await testingCollision()
      setSideMovementInProgress(false)
    }

    movingRight()

  }, [moveRight, activePieceCoordX, blockSize, sideMovementInProgress, fallSpeed, renderedActivePiece])


  // FIX STOPPED PIECE POSITION
  useEffect(() => {
    if (activePieceFalling || !activePiece || !activePieceRef.current) {
      return
    }

    const resetPiece = async () => {
      const resetValue = () => {
        setRenderedActivePiece(null)
        setActivePieceCoordX(null)
        setActivePieceCoordY(null)
        setMoveLeft(false)
        setMoveRight(false)
        setMoveDown(false)
        return promise()
      }

      await resetValue()
      setActivePiece(null)
    }

    
    [].slice.call(activePieceRef.current.children).forEach((block) => {
      const blockBounds = block.getBoundingClientRect()
      
      const takenSpace = [].slice.call(mainGridRef.current.children).filter((space) => {
        const spaceRect = space.getBoundingClientRect()
        return (
          spaceRect.left <= blockBounds.left && spaceRect.right >= blockBounds.right &&
          spaceRect.top <= blockBounds.top && spaceRect.bottom >= blockBounds.bottom &&
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
        gridSpaces.push(<div id={`${x}, ${y}`} className="grid-space" key={`${x}, ${y}`}></div>)
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