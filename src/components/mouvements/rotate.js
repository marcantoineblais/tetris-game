
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
      const spaceBounds = space.getBoundingClientRect()
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

  const deg = parseInt(piece.style.transform.slice(7)) || 0
  piece.style.transform = `rotate(${(deg + 90) % 360}deg)`

  let collision
  [].slice.call(piece.children).forEach((block) => {
    if (checkForCollision(block.getBoundingClientRect(), mainGridRef, offset)) {
      collision = true
    }
  })
  
  if (collision) {
    piece.style.transform = `rotate(${deg}deg)`
    return false
  }

  return true
}

export default rotate