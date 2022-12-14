import { random } from "../../helpers"

export const spawnPiece = () => {
  const pieces = [
    {
      name: 'straightPiece',
      color: 'pink',
      center: { x: 6.5, y: 2.5 },
      geoCenter: { x: 2.5, y: 3 },
      maxRotation: 180,
      rotationOffset: {x: 0, y: 0},
      coordinates: [
        { x: -0.5, y: 0.5 },
        { x: -0.5, y: -0.5 },
        { x: -0.5, y: -1.5 },
        { x: -0.5, y: -2.5 }
      ],
    },
    {
      name: 'lPiece',
      color: 'orange',
      center: { x: 6.5, y: 2.5 },
      geoCenter: { x: 2, y: 3.5 },
      maxRotation: 360,
      rotationOffset: {x: 0.5, y: 0},
      coordinates: [
        { x: 0.5, y: -0.5},
        { x: -0.5, y: -0.5},
        { x: -0.5, y: -1.5},
        { x: -0.5, y: -2.5}
      ]
    },
    {
      name: 'revLPiece',
      color: 'purple',
      center: { x: 6.5, y: 2.5 },
      geoCenter: { x: 3, y: 3.5 },
      maxRotation: 360,
      rotationOffset: {x: -0.5, y: 0},
      coordinates: [
        { x: -1.5, y: -0.5},
        { x: -0.5, y: -0.5},
        { x: -0.5, y: -1.5},
        { x: -0.5, y: -2.5}
      ]
    },
    {
      name: 'zPiece',
      color: 'blue',
      center: { x: 6.5, y: 1.5 },
      geoCenter: { x: 3, y: 2.5 },
      maxRotation: 180,
      rotationOffset: {x: -0.5, y: 0},
      coordinates: [
        { x: -0.5, y: 0.5 },
        { x: -0.5, y: -0.5 },
        { x: -1.5, y: -0.5 },
        { x: -1.5, y: -1.5 },
      ]
    },
    {
      name: 'revZPiece',
      color: 'red',
      center: { x: 5.5, y: 1.5 },
      geoCenter: { x: 2, y: 2.5 },
      rotationOffset: {x: 0.5, y: 0},
      maxRotation: 180,
      coordinates: [
        { x: -0.5, y: 0.5 },
        { x: -0.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: 0.5, y: -1.5 },
      ]
    },
    {
      name: 'squarePiece',
      color: 'grey',
      center: { x: 7, y: 1 },
      geoCenter: { x: 2.5, y: 2.5 },
      maxRotation: 0,
      rotationOffset: {x: 0, y: 0},
      coordinates: [
        { x: 0, y: 0 },
        { x: -1, y: 0 },
        { x: -1, y: -1 },
        { x: 0, y: -1 },
      ]
    },
    {
      name: 'singlePiece',
      color: 'black',
      center: { x: 6.5, y: 0.5 },
      geoCenter: { x: 2.5, y: 2.5 },
      maxRotation: 0,
      rotationOffset: {x: 0, y: 0},
      coordinates: [
        { x: -0.5, y: -0.5 }
      ]
    },
    {
      name: 'tPiece',
      color: 'green',
      center: { x: 6.5, y: 1.5 },
      geoCenter: { x: 2, y: 2.5 },
      maxRotation: 360,
      rotationOffset: {x: 0.5, y: 0},
      coordinates: [
        { x: -0.5, y: 0.5 },
        { x: -0.5, y: -0.5 },
        { x: 0.5, y: -0.5 },
        { x: -0.5, y: -1.5 }
      ]
    },
  ]
  const randomIndex = random(pieces.length)
  const randomPiece = pieces.filter((_v, i) => randomIndex === i).pop()
  return randomPiece
}
