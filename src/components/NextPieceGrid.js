import React, { useEffect, useRef, useState } from "react"

const NextPieceGrid = ({ piece, blockSize }) => {

  const [nextPiece, setNextPiece] = useState(null)
  const containerRef = useRef()
  const nextPieceRef = useRef()

  useEffect(() => {
    if (!blockSize) {
      return
    }

    const size = (5 * blockSize).toString()
    containerRef.current.style.height = size + 'px'
    containerRef.current.style.width = size + 'px'
  }, [blockSize])

  useEffect(() => {
    if (!piece) {
      return
    }

    const renderPiece = () => {
      const blocks = piece.coordinates.map((coord, i) => {
        const coordX = coord.x * blockSize
        const coordY = coord.y * blockSize
        
        const style = {
          width: (blockSize).toString() + 'px',
          height: (blockSize).toString() + 'px',
          left: coordX.toString() + 'px',
          top: coordY.toString() + 'px'
        }
       return <div className={'next-piece ' + piece.color} style={style} key={i}></div>
      })
            
      setNextPiece(blocks)
    }

    const left = (piece.geoCenter.x * blockSize).toString() + 'px'
    const top = (piece.geoCenter.y * blockSize).toString() + 'px'
    nextPieceRef.current.style.left = left
    nextPieceRef.current.style.top = top
    
    renderPiece()
  }, [piece, blockSize])

  return (
    <div className="next-grid-content">
      <h2>COMING NEXT</h2>
      <div ref={containerRef} className="grid">
        <div ref={nextPieceRef} style={{ position: 'absolute' }}>{nextPiece}</div>
      </div>
    </div>
  )
}

export default NextPieceGrid