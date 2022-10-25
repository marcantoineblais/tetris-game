import React from "react"
import { random } from "../../helpers"

export const spawnPiece = () => {
  const pieces = [
    {
      name: 'straightPiece',
      color: 'pink',
      coordinates: [
        { x: 6, y: 3 },
        { x: 6, y: 2 },
        { x: 6, y: 1 },
        { x: 6, y: 0 }
      ],
    },
    {
      name: 'lPiece',
      color: 'orange',
      coordinates: [
        { x: 7, y: 2},
        { x: 6, y: 2},
        { x: 6, y: 1},
        { x: 6, y: 0}
      ]
    }
  ]
  const randomIndex = random(pieces.length)
  const randomPiece = pieces.filter((_v, i) => randomIndex === i).pop()
  return randomPiece
}

export const renderedPiece = (activePiece, blockSize) => {
  const blocks = []
  const coordinates = []
  activePiece.coordinates.forEach((baseCoord, i) => {
    const coord = {
      x: baseCoord.x * blockSize,
      y: baseCoord.y * blockSize
    }
    const style = {
      width: blockSize.toString() + 'px',
      height: blockSize.toString() + 'px',
      left: coord.x.toString() + 'px',
      top: coord.y.toString() + 'px'
    }
    const block = <div className={'active-block ' + activePiece.color} style={style} key={i}></div>
    blocks.push(block)
    coordinates.push(coord)
  })

  return [blocks, coordinates]
}