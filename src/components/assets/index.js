import { random } from "../../helpers"

export const spawnPiece = () => {
  const pieces = [
    {
      name: 'straightPiece',
      color: 'pink',
      center: { x: 6.5, y: 2.5 },
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
      coordinates: [
        { x: -1.5, y: -0.5},
        { x: -0.5, y: -0.5},
        { x: -0.5, y: -1.5},
        { x: -0.5, y: -2.5}
      ]
    }
  ]
  const randomIndex = random(pieces.length)
  const randomPiece = pieces.filter((_v, i) => randomIndex === i).pop()
  return randomPiece
}
