
const moveDown = (mainGridRef, pieceRef, rate, offsetX) => {

  const checkForCollision = (blockBounds) => {
    const mainGridBounds = mainGridRef.current.getBoundingClientRect()
    if (blockBounds.bottom + rate > mainGridBounds.bottom) {
      return true
    }

    const blockBoundsX = []
    const blockBoundsY = []
    for (let i = blockBounds.left; i <= blockBounds.right; i++){
      blockBoundsX.push(i + offsetX)
    }

    for (let i = blockBounds.top; i <= blockBounds.bottom; i++){
      blockBoundsY.push(i + rate)
    }

    let collision
    [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
      const spaceBounds = space.getBoundingClientRect()
      if (
          blockBoundsX.some(n => n > spaceBounds.left && n < spaceBounds.right) &&
          blockBoundsY.some(n => n > spaceBounds.top && n <= spaceBounds.bottom)
      ) {
        collision = true
      }
    })

    return collision
  }

  let collision
  [].slice.call(pieceRef.current.children).forEach((block) => {
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