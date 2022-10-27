import React, { useEffect, useRef, useState } from "react"
import { spawnPiece } from "./assets"
import { promise, wait } from "../helpers"
import useMoveLeft from "./mouvements/useMoveLeft"
import useMoveRight from "./mouvements/useMoveRight"
import useMoveDown from "./mouvements/useMoveDown"
import useRotation from "./mouvements/useRotation"

const MainGrid = ({ container }) => {

  // width and height of a block
  const [blockSize, setBlockSize] = useState(null)
  
  // num of milliseconds to fall 1 block
  const [fallSpeed, setFallSpeed] = useState(750)
  const [dropRate, setDropRate] = useState(1)

  const [activePiece, setActivePiece] = useState(null)
  const [renderedActivePiece, setRenderedActivePiece] = useState(null)
  const [activePieceCoordX, setActivePieceCoordX] = useState(null)
  const [activePieceCoordY, setActivePieceCoordY] = useState(null)
  
  const [activePieceFalling, setActivePieceFalling] = useState(false)
  const [moveLeft, setMoveLeft, movingLeft] = useMoveLeft(false)
  const [moveRight, setMoveRight, movingRight] = useMoveRight(false)
  const [moveDown, setMoveDown, movingDown] = useMoveDown(false)
  const [rotation, setRotation, rotate] = useRotation(0)

  const [sideMovementInProgress, setSideMovementInProgress] = useState(false)
  const [downMovementInProgress, setDownMovementInProgress] = useState(false)
  const [rotationInProgress, setRotationInProgress] = useState(false)

  const mainGridRef = useRef()
  const activePieceRef = useRef()


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

    const renderedPiece = (activePiece, blockSize) => {
      const blocks = []
      activePiece.coordinates.forEach((baseCoord, i) => {
        const coordX = baseCoord.x * blockSize
        const coordY = baseCoord.y * blockSize
        
        const style = {
          width: blockSize.toString() + 'px',
          height: blockSize.toString() + 'px',
          left: coordX.toString() + 'px',
          top: coordY.toString() + 'px'
        }
        const block = <div className={'active-block ' + activePiece.color} style={style} key={i}></div>
        blocks.push(block)
      })
    
      return blocks
    }

    const renderedBlocks = renderedPiece(activePiece, blockSize)
    const coordX = activePiece.center.x * blockSize
    const coordY = activePiece.center.y * blockSize
    const top = coordY.toString() + 'px'
    const left = coordX.toString() + 'px'

    setRenderedActivePiece(
      <div ref={activePieceRef} className="active-container" style={{ position: 'absolute', top: top, left: left}}>
        {renderedBlocks}
      </div>
    )

    setActivePieceCoordX(coordX)
    setActivePieceCoordY(coordY)
    
  }, [blockSize, activePiece])


  // START ACTIVE PIECE FALL TIMER
  useEffect(() => {
    if (!renderedActivePiece || activePieceFalling || downMovementInProgress) {
      return
    }

    const startToFall = async () => {
      await wait(500)
      setActivePieceFalling(true)
    }

    startToFall()
  }, [renderedActivePiece, activePieceFalling, downMovementInProgress])


  // UPDATE ACTIVE PIECE POSITION
  useEffect(() => {
    if (!activePieceCoordY || !activePieceCoordX || !renderedActivePiece || !activePieceFalling || !activePiece) {
      return
    }

    activePieceRef.current.style.left = activePieceCoordX.toString() + 'px'
    activePieceRef.current.style.top = activePieceCoordY.toString() + 'px'

  }, [activePieceCoordY, activePieceCoordX, activePieceRef, activePiece, activePieceFalling, renderedActivePiece])


  // DEFINE INPUTS BUFFER AND LISTENER
  useEffect(() => {

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
        case ' ':
          setRotation(true)
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
  }, [activePieceFalling, setMoveLeft, setMoveRight, setRotation, setMoveDown])


  //LEFT MOVEMENT
  useEffect(() => {
    if (!activePieceFalling || !moveLeft || sideMovementInProgress || !renderedActivePiece) {
      return
    }

    const movement = async () => {
      setSideMovementInProgress(true)
      if (movingLeft(mainGridRef, activePieceRef)) {
        setActivePieceCoordX(activePieceCoordX - blockSize)
        await wait(48)
      }
      setSideMovementInProgress(false)
    }

    movement()

  }, [moveLeft, movingLeft, activePieceCoordX, blockSize, sideMovementInProgress, fallSpeed, renderedActivePiece, activePieceFalling])


  //RIGHT MOVEMENT
  useEffect(() => {
    if (!activePieceFalling || !moveRight || sideMovementInProgress || !renderedActivePiece) {
      return
    }
    const movement = async () => {
      setSideMovementInProgress(true)
      if (movingRight(mainGridRef, activePieceRef)) {
        setActivePieceCoordX(activePieceCoordX + blockSize)
        await wait(48)
      }
      setSideMovementInProgress(false)
    }

    movement()

  }, [moveRight, activePieceCoordX, blockSize, sideMovementInProgress, fallSpeed, renderedActivePiece, movingRight, activePieceFalling])


  // DOWN MOVEMENT
  useEffect(() => {
    if (!activePieceFalling || !activePieceFalling || !activePieceCoordY || downMovementInProgress) {
      return
    }

    const pixelBeforeNextSpace = activePieceCoordY % 10 ? activePieceCoordY % 10 : 10
    const interval = moveDown ? fallSpeed / (blockSize * 10) : fallSpeed / (blockSize / dropRate)
    const numOfPixel = moveDown ? activePieceCoordY + pixelBeforeNextSpace : activePieceCoordY + dropRate

    const movement = async () => {
      setDownMovementInProgress(true)
      await wait(interval) 
      if (movingDown(mainGridRef, activePieceRef)) {
        setActivePieceCoordY(numOfPixel)
      } else {
        await wait(64)
        setActivePieceCoordY(activePieceCoordY)
        if (movingDown(mainGridRef, activePieceRef)) {
          setActivePieceCoordY(numOfPixel)
        } else {
          setActivePieceFalling(false)
        }
      }
      setDownMovementInProgress(false)
    }

    movement()
  }, [activePieceCoordY, activePieceFalling, blockSize, fallSpeed, downMovementInProgress, dropRate, movingDown, moveDown])


  // ROTATION MOVEMENT
  useEffect(() => {
    if (!activePieceRef.current || !activePieceFalling || !rotation || rotationInProgress) {
      return
    }
    
    const movement = async () => {
      setRotationInProgress(true)
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
      await wait(16)
      setRotationInProgress(false)
      setRotation(false)
    }
    
    movement()
  }, [activePieceFalling, activePieceRef, rotation, rotate, rotationInProgress, setRotation, blockSize, activePieceCoordX])

 
  // // FIX STOPPED PIECE POSITION
  useEffect(() => {
    if (activePieceFalling || !activePiece || !activePieceRef.current) {
      return
    }

    const resetPiece = async () => {
      const resetValue = () => {
        setRenderedActivePiece(null)
        setActivePieceCoordX(null)
        setActivePieceCoordY(null)
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
          spaceRect.top <= blockBounds.top && spaceRect.bottom <= blockBounds.bottom &&
          !space.classList.contains('active-block')
          )
      }).pop()
        
      takenSpace.classList.add('taken', activePiece.color)
    })
      
    resetPiece()
  }, [activePieceFalling, activePiece, setMoveLeft, setMoveRight, setMoveDown])

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