import { useState } from "react"

const useMoveLeft = (bool) => {

  const [moveLeft, setMoveLeft] = useState(bool)

  const checkForCollision = (blockBounds, mainGridRef) => {
    const mainGridBounds = mainGridRef.current.getBoundingClientRect()
    if (blockBounds.left === mainGridBounds.left) {
      return true
    }

    let collision
    [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
      const spaceBounds = space.getBoundingClientRect()
      if (
        (
          (spaceBounds.top <= blockBounds.top && spaceBounds.bottom - 3 > blockBounds.top) ||
          (spaceBounds.top < blockBounds.bottom && spaceBounds.bottom > blockBounds.bottom)
        ) && spaceBounds.right === blockBounds.left
      ) {
        collision = true
      }
    })

    return collision
  }

  const movingLeft = (mainGridRef, activePieceRef) => {
    let collision
    [].slice.call(activePieceRef.current.children).forEach((block) => {
      if (checkForCollision(block.getBoundingClientRect(), mainGridRef)) {
        collision = true
      }
    })

    if (!collision) {  
      return true
    }

    return false
  }

  return [moveLeft, setMoveLeft, movingLeft]
}

export default useMoveLeft