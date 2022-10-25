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
    },
    {
      name: 'revLPiece',
      color: 'purple',
      coordinates: [
        { x: 5, y: 2},
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
  const coordinatesX = []
  const coordinatesY = []
  activePiece.coordinates.forEach((baseCoord, i) => {
    const coordX = baseCoord.x * blockSize
    const coordY = baseCoord.y * blockSize
    
    const style = {
      width: blockSize.toString() + 'px',
      height: blockSize.toString() + 'px',
      left: coordX.toString() + 'px',
      top: coordY.toString() + 'px'
    }
    const block = <div className={'active-block ' + activePiece.color} style={style} key={i}></div>
    blocks.push(block)
    coordinatesX.push(coordX)
    coordinatesY.push(coordY)
  })

  return [blocks, coordinatesX, coordinatesY]
}