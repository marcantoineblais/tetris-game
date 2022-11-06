
const moveX = (mainGridRef, activePieceRef, blockSize) => {

  const checkForCollision = (blockBounds, mainGridRef) => {
    const mainGridBounds = mainGridRef.current.getBoundingClientRect()
    if (blockBounds.left + blockSize < mainGridBounds.left|| blockBounds.right + blockSize > mainGridBounds.right) {
      return true
    }

    const blockBoundsX = []
    const blockBoundsY = []

    for (let i = blockBounds.left; i <= blockBounds.right; i++){
      blockBoundsX.push(i + blockSize)
    }

    for (let i = blockBounds.top; i <= blockBounds.bottom; i++){
      blockBoundsY.push(i)
    }

    let collision
    [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
      const spaceBounds = space.getBoundingClientRect()
      if (
          blockBoundsX.some(n => n > spaceBounds.left && n < spaceBounds.right) &&
          blockBoundsY.some(n => n > spaceBounds.top && n < spaceBounds.bottom)
      ) {
        collision = true
      }
    })

    return collision
  }

  let collision
  [].slice.call(activePieceRef.current.children).forEach((block) => {
    if (checkForCollision(block.getBoundingClientRect(), mainGridRef)) {
      collision = true
    }
  })

  if (collision) {  
    return false
  }

  return true
}

export default moveX