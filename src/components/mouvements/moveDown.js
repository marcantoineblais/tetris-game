
const moveDown = (mainGridRef, pieceRef, rate) => {

  const checkForCollision = (blockBounds) => {
    const mainGridBounds = mainGridRef.current.children[263].children[0].getBoundingClientRect()
    if (blockBounds.bottom + rate > mainGridBounds.bottom) {
      return true
    }

    const blockBoundsX = []
    const blockBoundsY = []
    for (let i = blockBounds.left + 10; i <= blockBounds.right - 10; i++){
      blockBoundsX.push(i)
    }

    for (let i = blockBounds.top + 10; i <= blockBounds.bottom - 10; i++){
      blockBoundsY.push(i + rate)
    }

    let collision
    [].slice.call(mainGridRef.current.children).filter((space) => space.children[0].classList.contains('taken')).forEach((space) => {
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
    if (checkForCollision(block.children[0].getBoundingClientRect())) {
      collision = true
    }
  })
  
  if (collision) {
    return false
  }
  
  return true 
}

export default moveDown