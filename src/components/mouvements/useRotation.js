import { useState } from "react"


const useRotation = (bool) => {

  const [rotation, setRotation] = useState(bool)
  
  const checkForCollision = (blockBounds, mainGridRef, offSet) => {
    const mainGridBounds = mainGridRef.current.getBoundingClientRect()
    if (blockBounds.right + offSet === mainGridBounds.left) {
      return true
    }
    
    if (blockBounds.left + offSet === mainGridBounds.right ) {
      return true
    }
    
    let collision
    [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
      const spaceBounds = space.getBoundingClientRect()
      if (
        spaceBounds.top <= blockBounds.top + offSet &&
        spaceBounds.left === blockBounds.left + offSet &&
        spaceBounds.bottom <= blockBounds.bottom + offSet
      ) {
        collision = true
      }
    })
    
    return collision
  }
  
  const rotate = (mainGridRef, activePieceRef, offset = 0) => {
    const deg = parseInt(activePieceRef.current.style.transform.slice(7)) || 0
    activePieceRef.current.style.transform = 'rotate(' + (deg + 90) % 360 + 'deg)'

    let collision
    [].slice.call(activePieceRef.current.children).forEach((block) => {
      if (checkForCollision(block.getBoundingClientRect(), mainGridRef, offset)) {
        collision = true
      }
    })
    
    if (collision) {
      activePieceRef.current.style.transform = 'rotate(' + deg + 'deg)'
      return false
    }

    return true
  }

  return [rotation, setRotation, rotate]
}

export default useRotation