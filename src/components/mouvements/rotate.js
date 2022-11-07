const rotate = (mainGridRef, pieceRef, offset = 0) => {

  const piece = pieceRef.current
  const checkForCollision = (blockBounds, mainGridRef, offSet) => {
    const mainGridBounds = mainGridRef.current.getBoundingClientRect()
    if (
      blockBounds.right + offSet <= mainGridBounds.left ||
      blockBounds.left + offSet >= mainGridBounds.right ||
      blockBounds.bottom > mainGridBounds.bottom
    ) {
      return true
    }
    
    let collision
    [].slice.call(mainGridRef.current.children).filter((space) => space.classList.contains('taken')).forEach((space) => {
      const spaceBounds = space.children[0].getBoundingClientRect()
      if (
        (
          (spaceBounds.top <= blockBounds.top && spaceBounds.bottom - 3 > blockBounds.top) ||
          (spaceBounds.top < blockBounds.bottom && spaceBounds.bottom > blockBounds.bottom)
        ) && (
          spaceBounds.right === blockBounds.right + offSet || spaceBounds.left === blockBounds.left + offSet
        )
      ) {
        collision = true
      }
    })
    
    return collision
  }

  const beforeRotation = piece.style.transform
  const currentValue = piece.style.transform.split("(")
  const zDegrees = (parseInt(currentValue[1]) + 90) % 360
  piece.style.transform = `rotateZ(${zDegrees}deg)`

  let collision
  [].slice.call(piece.children).forEach((block) => {
    if (checkForCollision(block.children[0].getBoundingClientRect(), mainGridRef, offset)) {
      collision = true
    }
  })
  
  if (collision) {
    piece.style.transform = beforeRotation
    return false
  }

  return true
}

export default rotate