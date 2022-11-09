
const moveDown = (mainGridBounds, mainGridSpaces, pieceRef, takenSpaces, rate, blockSize) => {

  const checkForCollision = (blockBounds) => {
    if (blockBounds.bottom + rate > mainGridBounds.bottom) {
      return true
    }
   
    const blockBoundsY = [blockBounds.top + 2, (blockBounds.top + blockBounds.bottom) / 2, blockBounds.bottom - 2].map(n => n + rate)

    let collision
    const spaces = mainGridSpaces
    for (let i = 0; i < takenSpaces.length; i++) {
      const index = takenSpaces[i]
      const spaceBounds = spaces[index].getBoundingClientRect()
      if (spaceBounds.top > blockBounds.bottom + rate) {
        continue
      }

      if (spaceBounds.left !== blockBounds.left + blockSize) {
        continue
      }

      if (blockBoundsY.some(n => n > spaceBounds.top && n <= spaceBounds.bottom)) {
        collision = true
        break
      }
    }

    return collision
  }

  const blocks = pieceRef.current.children
  let collision
  for (let i = 0; i < blocks.length; i++) {
    if (checkForCollision(blocks[i].getBoundingClientRect())) {
      collision = true
    }
  }
  
  if (collision) {
    return false
  }
  
  return true 
}

export default moveDown