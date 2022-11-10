const rotate = (mainGridBounds, mainGridSpaces, pieceRef, takenSpaces, offset = 0) => {

  const piece = pieceRef.current
  const checkForCollision = (blockBounds) => {
    if (
      blockBounds.right + offset <= mainGridBounds.left ||
      blockBounds.left + offset >= mainGridBounds.right ||
      blockBounds.bottom > mainGridBounds.bottom
    ) {
      return true
    }
    
    const blockBoundsX = [blockBounds.left + 2, (blockBounds.right + blockBounds.left) / 2, blockBounds.right - 2].map(n => n + offset)
    const blockBoundsY = [blockBounds.top + 2, (blockBounds.top + blockBounds.bottom) / 2, blockBounds.bottom - 2]

    let collision
    const spaces = mainGridSpaces
    for (let i = 0; i < takenSpaces.length; i++) {
      const index = takenSpaces[i]
      const spaceBounds = spaces[index].getBoundingClientRect() 
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

  const beforeRotation = piece.style.transform
  const currentValue = piece.style.transform.split("(")
  const zDegrees = (parseInt(currentValue[1]) + 90) % 360
  piece.style.transform = `rotateZ(${zDegrees}deg)`

  const blocks = pieceRef.current.children
  let collision
  for (let i = 0; i < blocks.length; i++) {
    if (checkForCollision(blocks[i].getBoundingClientRect())) {
      collision = true
      break
    }
  }
  
  if (collision) {
    piece.style.transform = beforeRotation
    return false
  }

  return true
}

export default rotate