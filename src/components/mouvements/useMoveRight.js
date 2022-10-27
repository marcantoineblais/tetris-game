import { useState } from "react"

const useMoveRight = (bool) => {

  const [moveRight, setMoveRight] = useState(bool)

  const checkForCollision = (blockBounds, mainGridRef) => {
    const mainGridBounds = mainGridRef.current.getBoundingClientRect()
    if (blockBounds.right === mainGridBounds.right) {
      return true
    }

    let collision
    [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
      const spaceBounds = space.getBoundingClientRect()
      if (
        spaceBounds.top - blockBounds.bottom <= 0 &&
        spaceBounds.bottom < blockBounds.top &&
        spaceBounds.left === blockBounds.right
      ) {
        collision = true
      }
    })

    return collision
  }

  const movingRight = (mainGridRef, activePieceRef) => {
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

  return [moveRight, setMoveRight, movingRight]
}

export default useMoveRight