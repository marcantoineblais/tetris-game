
const moveDown = (mainGridRef, activePieceRef) => {

  const checkForCollision = (blockBounds) => {
    const mainGridBounds = mainGridRef.current.getBoundingClientRect()
    if (blockBounds.bottom >= mainGridBounds.bottom) {
      return true
    }

    let collision
    [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
      const spaceBounds = space.getBoundingClientRect()
      if (spaceBounds.top <= blockBounds.bottom && spaceBounds.bottom >= blockBounds.bottom && spaceBounds.left <= blockBounds.left && spaceBounds.right >= blockBounds.right) {
        collision = true
      }
    })

    return collision
  }

  let collision
  [].slice.call(activePieceRef.current.children).forEach((block) => {
    if (checkForCollision(block.getBoundingClientRect())) {
      collision = true
    }
  })
  
  if (collision) {
    return false
  }
  
  return true 
}

export default moveDown