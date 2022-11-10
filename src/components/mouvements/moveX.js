
const moveX = (mainGridBounds, mainGridSpaces, pieceRef, takenSpaces, blockSize) => {

  const checkForCollision = (blockBounds) => {
    if (blockBounds.left + blockSize < mainGridBounds.left || blockBounds.right + blockSize > mainGridBounds.right) {
      return true
    }

    const blockBoundsX = [blockBounds.left + 2, (blockBounds.right + blockBounds.left) / 2, blockBounds.right - 2].map(n => n + blockSize)
    const blockBoundsY = [blockBounds.top + 2, (blockBounds.top + blockBounds.bottom) / 2, blockBounds.bottom - 2]

    let collision
    const spaces = mainGridSpaces
    for (let i = 0; i < takenSpaces.length; i++) {
      const index = takenSpaces[i]
      const spaceBounds = spaces[index].getBoundingClientRect()

      if (spaceBounds.bottom < blockBounds.top) {
        break
      }

      if (spaceBounds.top > blockBounds.bottom) {
        continue
      }

      if (!blockBoundsX.some(n => n > spaceBounds.left && n <= spaceBounds.right)) {
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
      break
    }
  }

  if (collision) {  
    return false
  }

  return true
}

export default moveX