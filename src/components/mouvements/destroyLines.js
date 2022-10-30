
const destroyLines = (mainGridRef) => {

  const grid = mainGridRef.current
  const spaces = [].slice.call(grid.children)
  let count = 0
  for (let i = 0; i < grid.children.length - 12; i += 12) {
    if (spaces.slice(i, i + 12).every(space => space.classList.contains('taken'))) {
      count += 1
      const previousSpaces = spaces.slice(0, i + 12).reverse()
      previousSpaces.forEach((space, j) => space.className = spaces[i - j - 1] ? spaces[i - j - 1].className : 'grid-space')
    }
  }

  return count
}

export default destroyLines