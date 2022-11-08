
const moveX = (mainGridRef, activePieceRef, direction) => {

  const checkForCollision = (blockBounds, mainGridRef) => {
    const mainGridBoundsLeft = mainGridRef.current.children[0].children[0].getBoundingClientRect().left
    const mainGridBoundsRight = mainGridRef.current.children[263].children[0].getBoundingClientRect().right
    const blockSize = (blockBounds.right - blockBounds.left) * direction
    if (blockBounds.left + blockSize < mainGridBoundsLeft || blockBounds.right + blockSize > mainGridBoundsRight) {
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
    [].slice.call(mainGridRef.current.children).filter((space) => space.children[0].classList.contains('taken')).forEach((space) => {
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
    if (checkForCollision(block.children[0].getBoundingClientRect(), mainGridRef)) {
      collision = true
    }
  })

  if (collision) {  
    return false
  }

  return true
}

export default moveX