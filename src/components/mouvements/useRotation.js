import { useState } from "react"


const useRotation = (bool) => {

  const [rotation, setRotation] = useState(bool)
  
  const checkForCollision = (blockBounds, mainGridRef) => {
    const mainGridBounds = mainGridRef.current.getBoundingClientRect()
    if (blockBounds.right === mainGridBounds.left) {
      return true
    }
    
    if (blockBounds.left === mainGridBounds.right ) {
      return true
    }
    
    let collision
    [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
      const spaceBounds = space.getBoundingClientRect()
      if (spaceBounds.top === blockBounds.top && spaceBounds.left === blockBounds.left) {
        collision = true
      }
    });
    
    return collision
  }
  
  const rotate = (mainGridRef, activePieceRef) => {
    const deg = parseInt(activePieceRef.current.style.transform.slice(7)) || 0
    activePieceRef.current.style.transform = 'rotate(' + (deg + 90) % 360 + 'deg)'

    let collision
    [].slice.call(activePieceRef.current.children).forEach((block) => {
      if (checkForCollision(block.getBoundingClientRect(), mainGridRef)) {
        collision = true
      }
    })
    
    if (collision) {
      activePieceRef.current.style.transform = 'rotate(' + deg + 'deg)'
    }
  }

  return [rotation, setRotation, rotate]
}

export default useRotation