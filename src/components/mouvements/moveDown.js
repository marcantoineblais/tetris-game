
const moveDown = (mainGridRef, pieceRef, rate, blockSize) => {

  const checkForCollision = (blockBounds) => {
    const mainGridBounds = mainGridRef.current.getBoundingClientRect()
    if (blockBounds.bottom + rate > mainGridBounds.bottom) {
      return true
    }
   
    const blockBoundsY = []

    for (let i = blockBounds.top; i <= blockBounds.bottom; i++){
      blockBoundsY.push(i + rate)
    }

    let collision
    const spaces = mainGridRef.current.children
    for (let i = 0; i < spaces.length; i++) {
      if (!spaces[i].classList.contains('taken')) {
        continue
      }

      const spaceBounds = spaces[i].getBoundingClientRect()
      if (spaceBounds.left !== blockBounds.left + blockSize) {
        continue
      }

      if (spaceBounds.top > blockBounds.bottom) {
        i += 11
        continue
      } 

      if (blockBoundsY.some(n => n > spaceBounds.top && n <= spaceBounds.bottom)) {
        collision = true
        break
      }
    }

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